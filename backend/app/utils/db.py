"""MongoDB connection singleton."""
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

_client = None
_db = None


def get_db():
    """Return a cached MongoDB database instance."""
    global _client, _db
    if _db is None:
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/policy_simulator")
        db_name = uri.split("/")[-1].split("?")[0]
        try:
            _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # Verify connection
            _client.admin.command("ping")
            _db = _client[db_name]
        except ConnectionFailure as exc:
            raise RuntimeError(f"Cannot connect to MongoDB: {exc}") from exc
    return _db


def close_db():
    """Close the MongoDB connection."""
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
