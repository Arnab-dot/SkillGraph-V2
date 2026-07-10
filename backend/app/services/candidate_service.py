import random
import json
from typing import List, Dict, Any
from pathlib import Path
import pandas as pd
from backend.app.config import settings
from ml.src.config import TARGET_ROLE_SKILLS, ALL_SKILLS, SKILL_DICTIONARY
from ml.src.skill_extractor import SkillExtractor

# Stable seed
rng = random.Random(42)

CANDIDATES = []

def generate_candidates():
    global CANDIDATES
    if CANDIDATES:
        return
        
    first_names = ["John", "Jane", "Alex", "Emily", "Michael", "Sarah", "David", "Jessica", "James", "Emma",
                   "Robert", "Olivia", "William", "Sophia", "Joseph", "Isabella", "Daniel", "Mia", "Matthew", "Charlotte",
                   "Arjun", "Neha", "Aarav", "Priya", "Rohan", "Ananya", "Kabir", "Diya", "Reyansh", "Ishaan",
                   "Chen", "Wei", "Li", "Yan", "Min-Ji", "Ji-Woo", "Sato", "Yuki", "Kenji", "Haruto"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                  "Sharma", "Patel", "Gupta", "Verma", "Reddy", "Rao", "Nair", "Joshi", "Kumar", "Singh",
                  "Zhang", "Wang", "Li", "Liu", "Kim", "Park", "Lee", "Tanaka", "Suzuki", "Sato"]
                  
    roles = list(TARGET_ROLE_SKILLS.keys())
    
    # We will generate 450 candidates
    for i in range(1, 451):
        cand_id = f"cand_{i}"
        first_name = rng.choice(first_names)
        last_name = rng.choice(last_names)
        name = f"{first_name} {last_name}"
        
        # Distribute roles
        role = roles[i % len(roles)]
        
        # Distribute seniority
        seniority_rand = rng.random()
        if seniority_rand < 0.20:
            seniority = 'Junior'
            exp_years = rng.randint(1, 2)
        elif seniority_rand < 0.55:
            seniority = 'Mid'
            exp_years = rng.randint(3, 5)
        elif seniority_rand < 0.85:
            seniority = 'Senior'
            exp_years = rng.randint(6, 8)
        else:
            seniority = 'Lead'
            exp_years = rng.randint(9, 15)
            
        # Core skills for the role
        core_skills = TARGET_ROLE_SKILLS[role]
        
        # How many core skills do they possess?
        if seniority == 'Junior':
            num_core = rng.randint(max(1, int(len(core_skills)*0.4)), max(2, int(len(core_skills)*0.6)))
        elif seniority == 'Mid':
            num_core = rng.randint(max(2, int(len(core_skills)*0.6)), max(3, int(len(core_skills)*0.8)))
        else:
            num_core = rng.randint(max(3, int(len(core_skills)*0.8)), len(core_skills))
            
        num_core = max(1, min(num_core, len(core_skills)))
        cand_skills = set(rng.sample(core_skills, num_core))
        
        # Add 1-2 soft skills
        soft_skills = SKILL_DICTIONARY.get('soft_skills', [])
        if soft_skills:
            cand_skills.update(rng.sample(soft_skills, rng.randint(1, 2)))
            
        # Add 1-3 random general tech skills
        general_skills = [s for s in ALL_SKILLS if s not in core_skills and s not in soft_skills]
        if general_skills:
            cand_skills.update(rng.sample(general_skills, rng.randint(1, 3)))
            
        # Non-traditional profiles (10% chance)
        non_traditional = rng.random() < 0.10
        if non_traditional:
            # Drop some core skills and replace with other domain skills
            cand_skills = set(list(cand_skills)[:max(1, len(cand_skills)//2)])
            other_role = rng.choice([r for r in roles if r != role])
            cand_skills.update(rng.sample(TARGET_ROLE_SKILLS[other_role], rng.randint(2, 5)))
            
        # Job titles history
        if seniority == 'Lead':
            titles = [f"Lead {role}", f"Senior {role}"]
        elif seniority == 'Senior':
            titles = [f"Senior {role}", role]
        elif seniority == 'Mid':
            titles = [role, f"Junior {role}"]
        else:
            titles = [f"Junior {role}", "Intern"]
            
        CANDIDATES.append({
            "candidate_id": cand_id,
            "name": name,
            "role": role,
            "seniority": seniority,
            "experience_years": exp_years,
            "skills": sorted(list(cand_skills)),
            "top_job_titles": titles,
            "non_traditional": non_traditional
        })

# Initial call to populate
generate_candidates()

def get_pool_analytics() -> Dict[str, Any]:
    generate_candidates()
    
    total = len(CANDIDATES)
    
    # Seniority distribution
    seniority_dist = {}
    for c in CANDIDATES:
        seniority_dist[c['seniority']] = seniority_dist.get(c['seniority'], 0) + 1
        
    # Skill distribution
    skill_dist = {}
    for c in CANDIDATES:
        for s in c['skills']:
            skill_dist[s] = skill_dist.get(s, 0) + 1
            
    top_skills = [{"skill": k, "count": v} for k, v in skill_dist.items()]
    top_skills.sort(key=lambda x: x['count'], reverse=True)
    
    # Cluster coverage
    cluster_coverage = {}
    roles = list(TARGET_ROLE_SKILLS.keys())
    for r in roles:
        core = TARGET_ROLE_SKILLS[r]
        role_cands = [c for c in CANDIDATES if c['role'] == r]
        
        # Calculate avg fit potential
        total_fit = 0.0
        for rc in role_cands:
            overlap = len(set(rc['skills']) & set(core))
            total_fit += overlap / len(core) if core else 0.0
            
        avg_fit = total_fit / len(role_cands) if role_cands else 0.0
        
        cluster_coverage[r] = {
            "total_candidates": len(role_cands),
            "avg_fit_potential": round(avg_fit, 3)
        }
        
    # Supply depth: candidates covering >= 70% of each cluster's core skills
    supply_depth = {}
    for r in roles:
        core = TARGET_ROLE_SKILLS[r]
        depth_count = 0
        for c in CANDIDATES:
            overlap = len(set(c['skills']) & set(core))
            if len(core) > 0 and (overlap / len(core)) >= 0.70:
                depth_count += 1
        supply_depth[r] = depth_count
        
    return {
        "total_candidates": total,
        "skill_distribution": skill_dist,
        "top_skills": top_skills,
        "seniority_distribution": seniority_dist,
        "cluster_coverage": cluster_coverage,
        "supply_depth": supply_depth
    }

def rank_candidates(jd_text: str, top_n: int = 20) -> Dict[str, Any]:
    generate_candidates()
    
    # 1. Extract explicit skills from JD
    extractor = SkillExtractor()
    explicit_skills = sorted(list(set(extractor.extract_skills(jd_text))))
    
    # 2. Determine domain cluster (role with highest overlap of explicit skills)
    best_role = "ML Engineer"
    max_overlap = -1
    for role, core in TARGET_ROLE_SKILLS.items():
        overlap = len(set(explicit_skills) & set(core))
        if overlap > max_overlap:
            max_overlap = overlap
            best_role = role
            
    # 3. Determine implied skills using the co-occurrence graph
    implied_skills = []
    graph_path = settings.GRAPH_OUTPUT_DIR / 'skill_graph.json'
    if graph_path.exists():
        try:
            with open(graph_path) as f:
                graph_data = json.load(f)
            edges = graph_data.get('edges', [])
            
            # Find neighbors of explicit skills
            neighbors = {}
            for e in edges:
                src, tgt, w = e['source'], e['target'], e['weight']
                if src in explicit_skills and tgt not in explicit_skills:
                    neighbors[tgt] = neighbors.get(tgt, 0.0) + w
                elif tgt in explicit_skills and src not in explicit_skills:
                    neighbors[src] = neighbors.get(src, 0.0) + w
                    
            # Sort neighbors by accumulated weight
            sorted_neighbors = sorted(neighbors.items(), key=lambda x: x[1], reverse=True)
            implied_skills = [item[0] for item in sorted_neighbors[:5]]
        except Exception:
            pass
            
    if not implied_skills:
        # Fallback implied: remaining core skills for the best matching role
        core = TARGET_ROLE_SKILLS[best_role]
        implied_skills = sorted(list(set(core) - set(explicit_skills)))[:4]
        
    # 4. Seniority mapping
    jd_text_lower = jd_text.lower()
    if any(kw in jd_text_lower for kw in ['lead', 'principal', 'manager', 'director']):
        jd_seniority = 'Lead'
    elif 'senior' in jd_text_lower:
        jd_seniority = 'Senior'
    elif 'junior' in jd_text_lower:
        jd_seniority = 'Junior'
    else:
        jd_seniority = 'Mid'
        
    # 5. Score candidates
    ranked = []
    
    explicit_set = set(explicit_skills)
    implied_set = set(implied_skills)
    combined_jd_skills = explicit_set | implied_set
    
    for c in CANDIDATES:
        c_skills = set(c['skills'])
        
        # Matched and missing skills
        matched = sorted(list(c_skills & explicit_set))
        missing = sorted(list(explicit_set - c_skills))
        
        # Semantic score (overlap with explicit skills)
        if explicit_set:
            semantic_score = len(c_skills & explicit_set) / len(explicit_set)
        else:
            semantic_score = 0.5
            
        # Graph alignment score (overlap with implied skills)
        if implied_set:
            graph_alignment_score = len(c_skills & implied_set) / len(implied_set)
        else:
            graph_alignment_score = 0.5
            
        # Trajectory score
        sen_levels = ['Junior', 'Mid', 'Senior', 'Lead']
        c_idx = sen_levels.index(c['seniority'])
        jd_idx = sen_levels.index(jd_seniority)
        
        diff = c_idx - jd_idx
        if diff == 0:
            trajectory_score = 0.95
            trajectory_note = f"Matches required seniority ({c['seniority']}) perfectly."
        elif diff == -1:
            trajectory_score = 0.85
            trajectory_note = f"Ready to step up from {c['seniority']} to {jd_seniority} role."
        elif diff == 1:
            trajectory_score = 0.80
            trajectory_note = f"Slightly overqualified ({c['seniority']} for {jd_seniority} role)."
        elif diff < -1:
            trajectory_score = 0.50
            trajectory_note = f"Needs more experience. High seniority gap."
        else:
            trajectory_score = 0.60
            trajectory_note = f"Overqualified. Candidate holds {c['seniority']} role."
            
        # Transferability score
        if c_skills:
            transferability_score = len(c_skills & combined_jd_skills) / len(c_skills)
        else:
            transferability_score = 0.0
            
        # Total score
        total_score = (semantic_score * 0.5) + (graph_alignment_score * 0.25) + (trajectory_score * 0.25)
        
        # Strengths & gaps
        strengths = matched[:3]
        gaps_with_transferability = []
        for ms in missing:
            is_transferable = ms in implied_set or rng.random() < 0.3
            gaps_with_transferability.append({
                "skill": ms,
                "transferable": is_transferable
            })
            
        overall_fit = "Strong" if total_score >= 0.75 else "Moderate" if total_score >= 0.5 else "Weak"
        
        ranked.append({
            "candidate_id": c['candidate_id'],
            "name": c['name'],
            "total_score": round(total_score, 3),
            "semantic_score": round(semantic_score, 3),
            "graph_alignment_score": round(graph_alignment_score, 3),
            "trajectory_score": round(trajectory_score, 3),
            "transferability_score": round(transferability_score, 3),
            "matched_skills": matched,
            "missing_skills": missing,
            "experience_years": c['experience_years'],
            "top_job_titles": c['top_job_titles'],
            "non_traditional": c['non_traditional'],
            "fit_card": {
                "overall_fit": overall_fit,
                "strengths": strengths,
                "gaps": gaps_with_transferability[:4],
                "trajectory_note": trajectory_note,
                "graph_coverage_pct": int(semantic_score * 100)
            }
        })
        
    ranked.sort(key=lambda x: x['total_score'], reverse=True)
    
    return {
        "jd_profile": {
            "explicit_skills": explicit_skills,
            "implied_skills": implied_skills,
            "seniority": jd_seniority,
            "domain_cluster": best_role
        },
        "ranked_candidates": ranked[:top_n]
    }

def get_candidate_skill_forecast(candidate_id: str) -> Dict[str, Any]:
    generate_candidates()
    
    # Find candidate
    cand = next((c for c in CANDIDATES if c['candidate_id'] == candidate_id), None)
    if not cand:
        return {"skill_forecasts": []}
        
    # Read skill trends
    trends_map = {}
    trends_path = settings.TREND_OUTPUT_DIR / 'skill_trends.csv'
    if trends_path.exists():
        try:
            df = pd.read_csv(trends_path)
            for _, row in df.iterrows():
                trends_map[row['skill']] = {
                    "trend": row['trend'],
                    "growth_score": row['growth_score']
                }
        except Exception:
            pass
            
    forecasts = []
    for skill in cand['skills']:
        trend_info = trends_map.get(skill, {"trend": "stable", "growth_score": 1.0})
        
        # Clean trend name
        t_status = trend_info['trend']
        if t_status in ['emerging', 'growing']:
            status = 'rising'
        elif t_status in ['declining', 'rapidly_declining']:
            status = 'declining'
        else:
            status = 'stable'
            
        forecasts.append({
            "skill": skill,
            "trend": status,
            "growth_score": float(trend_info['growth_score'])
        })
        
    return {"skill_forecasts": forecasts}
