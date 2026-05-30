@echo off
echo ===========================================
echo Sedang deploy ke Cloud Run...
echo ===========================================

set SERVICE_NAME=backend-marketplace
set REGION=asia-southeast2
set INSTANCE_CONNECTION_NAME=project-5ffb3e49-1a93-45bf-b6b:us-central1:marketplace-db

gcloud run deploy %SERVICE_NAME% ^
  --source . ^
  --region %REGION% ^
  --allow-unauthenticated ^
  --port 8080 ^
  --add-cloudsql-instances %INSTANCE_CONNECTION_NAME% ^
  --set-env-vars DATABASE_URL=mysql://adminapp:Marketplace2026%%23@localhost/marketplace_db?socket=%%2Fcloudsql%%2Fproject-5ffb3e49-1a93-45bf-b6b%%3Aus-central1%%3Amarketplace-db,JWT_SECRET=scribble_secret_key_2026,NODE_ENV=production

echo ===========================================
echo Deployment selesai!
echo ===========================================
pause