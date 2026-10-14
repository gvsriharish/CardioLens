"""Leakage-safe per-target model selection with fold-local preprocessing."""
import json
import hashlib
from pathlib import Path
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, brier_score_loss
from sklearn.model_selection import StratifiedKFold
from ml.dataset_generator import load_or_create_dataset_records
from ml.preprocessor import CardioPreprocessor
from ml.schema import TARGETS

MODELS_DIR = Path(__file__).resolve().parent.parent / 'models'

def _score(y, pred, prob):
    return {'accuracy': float(accuracy_score(y,pred)), 'precision': float(precision_score(y,pred,zero_division=0)),
            'recall': float(recall_score(y,pred,zero_division=0)), 'f1': float(f1_score(y,pred,zero_division=0)),
            'roc_auc': float(roc_auc_score(y,prob)) if len(np.unique(y)) == 2 else None,
            'brier_score': float(brier_score_loss(y,prob)), 'support': int(len(y)),
            'confusion_matrix': confusion_matrix(y,pred,labels=[0,1]).tolist()}

def train_pipeline(demo=False):
    records, synthetic = load_or_create_dataset_records(demo=demo)
    base = CardioPreprocessor()
    feature_rows, labels = base.extract_dataset(records)
    candidates = {
        'RandomForest': lambda: RandomForestClassifier(n_estimators=100,max_depth=6,random_state=42),
        'GradientBoosting': lambda: HistGradientBoostingClassifier(max_iter=80,max_depth=4,random_state=42),
        'LogisticRegression': lambda: LogisticRegression(max_iter=1000,random_state=42),
    }
    MODELS_DIR.mkdir(exist_ok=True)
    dataset_path = Path(__file__).resolve().parent.parent / 'data' / 'z_alizadeh_sani_dataset.csv'
    dataset_sha256 = hashlib.sha256(dataset_path.read_bytes()).hexdigest() if dataset_path.exists() else None
    meta = {'dataset_status':'synthetic' if synthetic else 'unverified', 'is_synthetic':synthetic,
            'dataset_sha256': dataset_sha256,
            'sample_count':len(records),'validation_methodology':'Stratified 5-fold CV; imputation, scaling, and encoding fitted within each training fold',
            'selection_methodology':'Candidate with highest pooled out-of-fold F1 selected independently per target; resulting metrics are selection-set estimates and may be optimistic',
            'excluded_leakage_columns':['CAD','Cath','LAD','LCX','RCA'],'targets':{},'target_metrics':{},
            'data_quality': {'duplicate_rows': len(records) - len({tuple(sorted(row.items())) for row in records}),
                             'missing_cells': sum(1 for row in records for value in row.values() if value is None or str(value).strip() == '')}}
    meta['target_distributions'] = {t:{'positive':int(np.sum(labels[t])), 'negative':int(len(labels[t])-np.sum(labels[t])),
        'positive_fraction':float(np.mean(labels[t]))} for t in TARGETS}
    for target in TARGETS:
        y = labels[target]
        counts = np.bincount(y, minlength=2)
        splits = min(5, int(counts.min()))
        if splits < 2:
            meta['targets'][target] = {'metrics_unavailable':'Insufficient examples per class'}
            stale_model = MODELS_DIR / f'{target.lower()}_model.joblib'
            if stale_model.exists():
                stale_model.unlink()
            continue
        cv = StratifiedKFold(n_splits=splits,shuffle=True,random_state=42)
        evals = {}
        for name, factory in candidates.items():
            truth=[]; predicted=[]; probabilities=[]
            for tr, va in cv.split(np.zeros(len(y)),y):
                prep=CardioPreprocessor().fit([feature_rows[i] for i in tr])
                xtr=prep.transform([feature_rows[i] for i in tr]); xva=prep.transform([feature_rows[i] for i in va])
                model=factory().fit(xtr,y[tr]); predicted.extend(model.predict(xva).tolist())
                truth.extend(y[va].tolist())
                probs=model.predict_proba(xva)
                probabilities.extend(probs[:,list(model.classes_).index(1)].tolist() if 1 in model.classes_ else [0.0]*len(va))
            evals[name]=_score(np.asarray(truth),np.asarray(predicted),np.asarray(probabilities))
        chosen=max(evals,key=lambda n:evals[n]['f1'])
        production_preprocessor=CardioPreprocessor().fit(feature_rows)
        all_x=production_preprocessor.transform(feature_rows)
        production_model=candidates[chosen]().fit(all_x,y)
        if target == TARGETS[0]: joblib.dump(production_preprocessor,MODELS_DIR/'preprocessor.joblib')
        joblib.dump(production_model,MODELS_DIR/f'{target.lower()}_model.joblib')
        scores=evals[chosen]
        meta['targets'][target]={'selected_model':chosen,'metrics':scores,'all_models':evals}
        meta['target_metrics'][target]={'model':chosen,**scores,
            'class_prevalence': meta['target_distributions'][target]['positive_fraction'],
            'positive_support': meta['target_distributions'][target]['positive'],
            'negative_support': meta['target_distributions'][target]['negative']}
    meta['feature_count']=len(CardioPreprocessor().fit(feature_rows).get_feature_names())
    meta['feature_names']=CardioPreprocessor().fit(feature_rows).get_feature_names()
    with open(MODELS_DIR/'metrics.json','w',encoding='utf-8') as f: json.dump(meta,f,indent=2)
    data_manifest = {
        'dataset_name': dataset_path.name,
        'source': 'Bundled workspace CSV; no external source record or license supplied',
        'provenance_status': 'synthetic' if synthetic else 'unverified',
        'provenance_evidence': 'Every row matches generate_synthetic_records(n_samples=303, random_state=42).' if synthetic else 'Local CSV does not match the bundled seeded generator; authenticity is not established.',
        'retrieval_date': None,
        'record_count': len(records),
        'column_count': len(records[0]) if records else 0,
        'sha256': dataset_sha256,
        'targets': {t: {'positive': meta['target_distributions'][t]['positive'], 'negative': meta['target_distributions'][t]['negative'],
                        'encoding': 'Synthetic generator binary status; not a clinically verified threshold'} for t in TARGETS},
        'target_generation_note': 'Synthetic labels are generated from seeded latent scores and quantiles in ml/dataset_generator.py; they are not measurements or clinical diagnoses.',
        'preprocessing': 'Outcome columns CAD, Cath, LAD, LCX, and RCA excluded from inputs. Numerical median imputation and scaling plus categorical mode imputation and one-hot encoding are fitted within each training fold.',
        'known_limitations': ['No authentic clinical dataset used', 'No external or held-out test cohort', 'No calibrated probabilities', 'No duplicate, missing, or invalid-row clinical adjudication']
    }
    (dataset_path.parent / 'manifest.json').write_text(json.dumps(data_manifest, indent=2), encoding='utf-8')
    artifact_paths = [MODELS_DIR / 'preprocessor.joblib'] + [MODELS_DIR / f'{t.lower()}_model.joblib' for t in TARGETS] + [MODELS_DIR / 'metrics.json']
    artifact_manifest = {
        'artifact_version': f"demo-{(dataset_sha256 or 'missing')[:12]}",
        'dataset_sha256': dataset_sha256,
        'training_config': {'random_state': 42, 'cv': 'StratifiedKFold, up to 5 folds', 'model_selection': 'highest pooled out-of-fold F1', 'candidate_models': list(candidates)},
        'artifacts': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in artifact_paths if p.exists()}
    }
    (MODELS_DIR / 'model_manifest.json').write_text(json.dumps(artifact_manifest, indent=2), encoding='utf-8')
    print(json.dumps({k:v for k,v in meta.items() if k!='feature_names'},indent=2))

if __name__ == '__main__':
    import argparse
    parser=argparse.ArgumentParser(); parser.add_argument('--demo',action='store_true'); args=parser.parse_args()
    train_pipeline(demo=args.demo)
