from typing import Any, Dict, Optional

def success_response(data: Any, message: str='Success') -> Dict[str, Any]:
    return {'status': 'success', 'message': message, 'data': data}

def error_response(message: str, code: int=400) -> Dict[str, Any]:
    return {'status': 'error', 'message': message, 'code': code}