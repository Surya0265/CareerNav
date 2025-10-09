import os

class Config:
    # Upload folder
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB

def get_config():
    """
    Return a config object.
    You can expand this later with environments (dev/prod).
    """
    return Config

def check_config():
    """
    Perform a simple config validation.
    """
    cfg = get_config()
    ok = True
    if not os.path.exists(cfg.UPLOAD_FOLDER):
        try:
            os.makedirs(cfg.UPLOAD_FOLDER, exist_ok=True)
        except Exception as e:
            print(f"Error creating upload folder: {e}")
            ok = False
    if not hasattr(cfg, "MAX_CONTENT_LENGTH"):
        print("MAX_CONTENT_LENGTH not found in config")
        ok = False
    return ok
