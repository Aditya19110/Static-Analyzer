import pefile
import hashlib
import os

def calculate_hashes(file_path):
    with open(file_path, 'rb') as f:
        data = f.read()
        return {
            "md5": hashlib.md5(data).hexdigest(),
            "sha1": hashlib.sha1(data).hexdigest(),
            "sha256": hashlib.sha256(data).hexdigest()
        }

def get_pe_info(file_path):
    pe = pefile.PE(file_path)
    info = {
        "entry_point": hex(pe.OPTIONAL_HEADER.AddressOfEntryPoint),
        "image_base": hex(pe.OPTIONAL_HEADER.ImageBase),
        "compile_time": pe.FILE_HEADER.TimeDateStamp
    }
    return info

def get_sections_info(file_path):
    pe = pefile.PE(file_path)
    sections = []
    for section in pe.sections:
        sections.append({
            "name": section.Name.decode(errors="ignore").strip("\x00"),
            "virtual_size": hex(section.Misc_VirtualSize),
            "raw_size": hex(section.SizeOfRawData),
            "entropy": section.get_entropy()
        })
    return sections

def get_imports(file_path):
    pe = pefile.PE(file_path)
    imports = []
    if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
        for entry in pe.DIRECTORY_ENTRY_IMPORT:
            dll = entry.dll.decode()
            funcs = [imp.name.decode() if imp.name else "None" for imp in entry.imports]
            imports.append({"dll": dll, "functions": funcs})
    return imports