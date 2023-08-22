from fastapi import FastAPI, Depends, Request
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.exceptions import HTTPException
from typing_extensions import Annotated
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import starlette.status as status
from fastapi.openapi.docs import (
    get_redoc_html,
    get_swagger_ui_html,
    get_swagger_ui_oauth2_redirect_html,
)

from .dependencies import *

app = FastAPI(docs_url=None, redoc_url=None)

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

################## Docs ##################
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="/static/js/swagger-ui-bundle.js",
        swagger_css_url="/static/css/swagger-ui.css",
    )


@app.get(app.swagger_ui_oauth2_redirect_url, include_in_schema=False)
async def swagger_ui_redirect():
    return get_swagger_ui_oauth2_redirect_html()


@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=app.title + " - ReDoc",
        redoc_js_url="/static/js/redoc.standalone.js",
    )

################## API ##################
@app.post("/remove-music/")
def musicless(ouput_file: Annotated[str, Depends(remove_music)]):
    if not ouput_file:
        raise HTTPException(status_code=400, detail="The server is busy, try again later")
    return {'file_url': ouput_file}


@app.get("/download/{file_path:path}", response_class=FileResponse)
async def download(file_path: str):
    return FileResponse(file_path, media_type='application/octet-stream', filename=file_path.split('/')[-1])


@app.post("/files/delete", include_in_schema=False)
def musicless(res: Annotated[bool, Depends(delete_files)]):
    return RedirectResponse('../files/all', status_code=status.HTTP_302_FOUND)

################## Simple Front ##################
@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def main(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "lang": 0})

@app.get("/ar", response_class=HTMLResponse, include_in_schema=False)
async def main_ar(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "lang": 0})

@app.get("/en", response_class=HTMLResponse, include_in_schema=False)
async def main_en(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "lang": 1})

@app.get("/files/all", response_class=HTMLResponse, include_in_schema=False)
async def files(paths: Annotated[dict, Depends(list_files)]):
    return templates.TemplateResponse("files.html", paths)