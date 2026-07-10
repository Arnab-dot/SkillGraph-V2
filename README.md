# SkillGraph

## About the Project

SkillGraph is an advanced end-to-end intelligence platform that acts as a bridge between market demand and candidate capabilities. By extracting, analyzing, clustering, and forecasting skills from vast datasets of job descriptions and resumes, SkillGraph provides deep insights into the evolving landscape of the labor market. 

At its core, SkillGraph uses state-of-the-art Machine Learning models to build dynamic co-occurrence graphs of skills. This allows organizations, recruiters, and job seekers to identify emerging market trends, map out related competencies, and perform high-precision gap analysis for any given role.

## Features

### 🔍 Advanced Skill Extraction & Parsing
- **Resume Parsing**: Seamlessly ingests and parses PDF resumes to extract structured data and professional competencies.
- **Job Description Decomposition**: Decomposes raw job postings to identify required hard skills, soft skills, and core qualifications.
- **Deep Embedding Generation**: Utilizes transformer models to generate dense vector embeddings of skills and profiles for accurate semantic representation and analysis.

### 🧠 Machine Learning & Analytics Pipeline
- **Topic Modeling & Clustering**: Employs BERTopic, UMAP, and HDBSCAN to intelligently group related jobs and discover latent skill clusters within the market.
- **Demand Forecasting**: Integrates a robust TensorFlow LSTM (Long Short-Term Memory) time-series model to predict skill demand across a 3-month future horizon, proactively identifying "emerging" and "declining" skills.
- **Anomaly Detection**: Uses custom PyTorch Autoencoders to identify non-traditional candidates or unusual job postings by calculating high-dimensional reconstruction errors.

### 🌐 Network & Graph Intelligence
- **Skill Co-occurrence Graph**: Constructs and visualizes complex network graphs that map out how frequently distinct skills are paired together in the real world.
- **Trend Analysis**: Tracks historical changes in skill prevalence, helping stakeholders understand longitudinal shifts in industry requirements.

### 📊 Interactive Dashboard & Gap Analysis
- **Candidate Anomaly Profiling**: Flags candidates that have rare or unconventional skill combinations, calculating specific anomaly and future growth scores.
- **Live Gap Analysis**: Compares an uploaded resume directly against target industry roles (e.g., Data Scientist, ML Engineer) to provide actionable feedback on matching, missing, or underdeveloped skills.
- **Data Visualization**: A rich, interactive React and Vite-based frontend dashboard equipped with Recharts and React Flow to visually explore forecasts, market gaps, and skill networks.
