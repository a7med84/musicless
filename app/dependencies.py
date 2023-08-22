from fastapi import UploadFile, Request, Form
from fastapi.exceptions import HTTPException
from typing_extensions import Annotated

from uuid import uuid4
from spleeter.separator import Separator
from moviepy.editor import VideoFileClip
from shutil import copyfileobj, rmtree
from os import mkdir, rename, path


def remove_music(file: UploadFile) -> str:
    # Ensure the file is audio or video
    if not any([x in file.content_type for x in ['audio', 'video']]):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # create direcory in temp folder
    new_dir = _new_dir()
    mkdir(f"{new_dir}/input")
    
    # save uploaded file
    fname_list = file.filename.split('.')
    src_file = f"{new_dir}/input/file.{fname_list[-1]}"
    output_file = f"{new_dir}/{'.'.join(fname_list[:-1])}-musicless.{fname_list[-1]}"
    with open(src_file, "wb") as buffer:
        copyfileobj(file.file, buffer)

    # try 2 times cause tensorflow raise error sometimes
    vocals = ""
    try:
        print('first try')
        out = _remove_music(src_file, new_dir, file.content_type, output_file, vocals)
        yield out
    except Exception as e:
        print('Error:', e)
        try:
            print('second try')
            out = _remove_music(src_file, new_dir, file.content_type, output_file, vocals)
            yield out
        except Exception as e:
            print('failed')
            print(e)
            if new_dir:
                rmtree(new_dir)
            yield ''
    finally:
        # run after the response sent
        # remove unneeded files and directory
        if f"{new_dir}/input":
            rmtree(f"{new_dir}/input")
        pass


def _remove_music(src_file, _dir, content_type, output_file, vocals="") -> str:
    vocals = vocals or _extract_vocals(src_file, _dir)
    out = _output_file(src_file, _dir, vocals, content_type)
    rename(out, output_file)
    return f"/download/{output_file}"


def _extract_vocals(src_file, _dir) -> str:
    sep_dir = "input/files"
    separator = Separator('spleeter:2stems')
    separator.separate_to_file(src_file, _dir, codec="mp3", filename_format=f"{sep_dir}/" + "{instrument}.{codec}")
    return path.join(_dir, f"{sep_dir}/vocals.mp3")


def _output_file(src_file, _dir, vocals, content_type) -> str:
    out = vocals
    if 'video' in content_type:
        clip = VideoFileClip(src_file, audio=False)
        out = path.join(_dir, "out.mp4")
        clip.write_videofile(out, audio=vocals)
    return out


def _new_dir() -> str:
    if not path.exists("temp"):
        mkdir("temp")
    try:
        dname = f"temp/{str(uuid4())}"
        mkdir(dname)
        return dname
    except FileExistsError:
        return _new_dir()


# manage files
def list_files(request: Request):
    import os
    from pathlib import Path
    from datetime import datetime, timedelta
    
    paths = []
    if path.exists('temp'):
        paths = sorted(Path('temp').iterdir(), key=os.path.getmtime)
        paths = [
            {
                'name': p.name,
                'files': os.listdir(p),
                'size': round(sum(f.stat().st_size for f in p.glob('**/*') if f.is_file()) /1024/1024, 2),
                'modified': datetime.fromtimestamp(p.stat().st_mtime)
            } for p in paths
            ]
    return {
            "request": request, "lang": 1, "paths":paths,
            'now': datetime.now(),
            'today':datetime.today().date(), 
            'yesterday':datetime.today().date() - timedelta(days=1),
            'weekb4': datetime.today().date() - timedelta(days=7),
            }


def delete_files(names: Annotated[str, Form()]):
    try:
        for dir in names.strip().split():
            rmtree(f'temp/{dir}')
    except Exception as e:
        print(e)
        return False
    return True