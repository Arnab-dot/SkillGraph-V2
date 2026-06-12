from pathlib import Path
from typing import Optional
from ml.src.utils import setup_logger
logger = setup_logger(__name__)

def parse_resume(file_path: str) -> str:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f'Resume file not found: {path}')
    suffix = path.suffix.lower()
    logger.info(f'Parsing resume: {path.name} (format: {suffix})')
    if suffix == '.pdf':
        return _parse_pdf(path)
    elif suffix == '.docx':
        return _parse_docx(path)
    elif suffix == '.txt':
        return _parse_txt(path)
    else:
        raise ValueError(f'Unsupported resume format: {suffix}. Supported: .pdf, .docx, .txt')

def parse_resume_bytes(content: bytes, filename: str) -> str:
    import tempfile
    import os
    suffix = Path(filename).suffix.lower()
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    try:
        text = parse_resume(tmp_path)
    finally:
        os.unlink(tmp_path)
    return text

def _parse_pdf(path: Path) -> str:
    try:
        import PyPDF2
        text_parts = []
        with open(path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        text = '\n'.join(text_parts)
        logger.info(f'PDF parsed: {len(text)} characters from {len(reader.pages)} pages')
        return text
    except ImportError:
        logger.warning('PyPDF2 not installed. Trying pdfplumber...')
        try:
            import pdfplumber
            text_parts = []
            with pdfplumber.open(path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            text = '\n'.join(text_parts)
            logger.info(f'PDF parsed with pdfplumber: {len(text)} characters')
            return text
        except ImportError:
            logger.error('No PDF parser available. Install PyPDF2 or pdfplumber: pip install PyPDF2 pdfplumber')
            raise ImportError('No PDF parser available. Install PyPDF2 or pdfplumber.')

def _parse_docx(path: Path) -> str:
    try:
        import docx
        doc = docx.Document(str(path))
        text_parts = []
        for para in doc.paragraphs:
            if para.text.strip():
                text_parts.append(para.text)
        text = '\n'.join(text_parts)
        logger.info(f'DOCX parsed: {len(text)} characters from {len(text_parts)} paragraphs')
        return text
    except ImportError:
        logger.error('python-docx not installed. Install with: pip install python-docx')
        raise ImportError('python-docx not installed. Install with: pip install python-docx')

def _parse_txt(path: Path) -> str:
    text = path.read_text(encoding='utf-8', errors='ignore')
    logger.info(f'TXT parsed: {len(text)} characters')
    return text