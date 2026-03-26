from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "KavachPay ML Service is running..."}
