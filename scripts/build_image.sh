cd ..

docker build -t yellyoshua/media_encoder -f ./infrastructure/docker/Dockerfile .
docker push yellyoshua/media_encoder:latest

# Execute deployment
kubectl scale --replicas=1 deployment media-encoder

# Get pod id (optional)
kubectl get pods --no-headers -o custom-columns=":metadata.name" --selector=app=media-encoder

# Execute bash in pod (optional)
kubectl exec -it pod_id -- /bin/bash

# Stop deployment
kubectl scale --replicas=0 deployment media-encoder
