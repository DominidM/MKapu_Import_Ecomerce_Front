"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var supabase_1 = require("@/lib/supabase");
var lucide_react_1 = require("lucide-react");
var initialForm = {
    titulo: "",
    descripcion: "",
    contenido: "",
    activo: true
};
var inp = {
    width: "100%",
    padding: "0.7rem 0.9rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "0.875rem",
    background: "#fff",
    color: "#1a1a1a",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s"
};
var lbl = {
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#444",
    marginBottom: "0.4rem"
};
function AdminBlogPage() {
    var _a = react_1.useState([]), rows = _a[0], setRows = _a[1];
    var _b = react_1.useState(initialForm), form = _b[0], setForm = _b[1];
    var _c = react_1.useState(null), editId = _c[0], setEditId = _c[1];
    var _d = react_1.useState(false), showForm = _d[0], setShowForm = _d[1];
    var _e = react_1.useState(""), search = _e[0], setSearch = _e[1];
    var _f = react_1.useState(true), loading = _f[0], setLoading = _f[1];
    var _g = react_1.useState([]), imagenes = _g[0], setImagenes = _g[1];
    var _h = react_1.useState([]), videos = _h[0], setVideos = _h[1];
    var _j = react_1.useState({}), mediaMap = _j[0], setMediaMap = _j[1];
    var _k = react_1.useState(false), uploadingImg = _k[0], setUploadingImg = _k[1];
    var _l = react_1.useState(false), uploadingVid = _l[0], setUploadingVid = _l[1];
    var _m = react_1.useState(false), savingOrder = _m[0], setSavingOrder = _m[1];
    var _o = react_1.useState(""), successMsg = _o[0], setSuccessMsg = _o[1];
    var imgRef = react_1.useRef(null);
    var vidRef = react_1.useRef(null);
    function load() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, posts, imgs, vids, mapa, _i, _b, img, _c, _d, vid;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        setLoading(true);
                        return [4 /*yield*/, Promise.all([
                                supabase_1.supabase.from("vlog_posts").select("*").order("orden"),
                                supabase_1.supabase.from("vlog_imagenes").select("vlog_post_id"),
                                supabase_1.supabase.from("vlog_videos").select("vlog_post_id"),
                            ])];
                    case 1:
                        _a = _e.sent(), posts = _a[0].data, imgs = _a[1].data, vids = _a[2].data;
                        setRows(posts !== null && posts !== void 0 ? posts : []);
                        mapa = {};
                        for (_i = 0, _b = imgs !== null && imgs !== void 0 ? imgs : []; _i < _b.length; _i++) {
                            img = _b[_i];
                            if (!mapa[img.vlog_post_id])
                                mapa[img.vlog_post_id] = { imgs: 0, vids: 0 };
                            mapa[img.vlog_post_id].imgs++;
                        }
                        for (_c = 0, _d = vids !== null && vids !== void 0 ? vids : []; _c < _d.length; _c++) {
                            vid = _d[_c];
                            if (!mapa[vid.vlog_post_id])
                                mapa[vid.vlog_post_id] = { imgs: 0, vids: 0 };
                            mapa[vid.vlog_post_id].vids++;
                        }
                        setMediaMap(mapa);
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        });
    }
    function loadMedia(postId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, imgs, vids;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            supabase_1.supabase
                                .from("vlog_imagenes")
                                .select("*")
                                .eq("vlog_post_id", postId)
                                .order("orden"),
                            supabase_1.supabase
                                .from("vlog_videos")
                                .select("*")
                                .eq("vlog_post_id", postId)
                                .order("orden"),
                        ])];
                    case 1:
                        _a = _b.sent(), imgs = _a[0].data, vids = _a[1].data;
                        setImagenes(imgs !== null && imgs !== void 0 ? imgs : []);
                        setVideos(vids !== null && vids !== void 0 ? vids : []);
                        return [2 /*return*/];
                }
            });
        });
    }
    react_1.useEffect(function () {
        load();
    }, []);
    function persistOrder(list) {
        return __awaiter(this, void 0, void 0, function () {
            var reordered;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setSavingOrder(true);
                        reordered = list.map(function (p, i) { return (__assign(__assign({}, p), { orden: i + 1 })); });
                        setRows(reordered);
                        return [4 /*yield*/, Promise.all(reordered.map(function (p) {
                                return supabase_1.supabase.from("vlog_posts").update({ orden: p.orden }).eq("id", p.id);
                            }))];
                    case 1:
                        _a.sent();
                        setSavingOrder(false);
                        return [2 /*return*/];
                }
            });
        });
    }
    function moveUp(idx) {
        var _a;
        if (idx === 0)
            return;
        var copy = __spreadArrays(rows);
        _a = [copy[idx], copy[idx - 1]], copy[idx - 1] = _a[0], copy[idx] = _a[1];
        void persistOrder(copy);
    }
    function moveDown(idx) {
        var _a;
        if (idx === rows.length - 1)
            return;
        var copy = __spreadArrays(rows);
        _a = [copy[idx], copy[idx + 1]], copy[idx + 1] = _a[0], copy[idx] = _a[1];
        void persistOrder(copy);
    }
    function uploadImagen(file) {
        return __awaiter(this, void 0, Promise, function () {
            var ext, path, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ext = file.name.split(".").pop();
                        path = "blog/imagenes/" + Date.now() + "." + ext;
                        return [4 /*yield*/, supabase_1.supabase.storage
                                .from("imagenes")
                                .upload(path, file, { upsert: true })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            alert("Error subiendo imagen: " + error.message);
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, supabase_1.supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl];
                }
            });
        });
    }
    function uploadVideo(file) {
        return __awaiter(this, void 0, Promise, function () {
            var ext, path, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ext = file.name.split(".").pop();
                        path = "blog/videos/" + Date.now() + "." + ext;
                        return [4 /*yield*/, supabase_1.supabase.storage
                                .from("imagenes")
                                .upload(path, file, { upsert: true })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            alert("Error subiendo video: " + error.message);
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, supabase_1.supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl];
                }
            });
        });
    }
    function handleImgUpload(e) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var files, baseOrden, i, url;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!editId)
                            return [2 /*return*/];
                        files = Array.from((_a = e.target.files) !== null && _a !== void 0 ? _a : []);
                        if (!files.length)
                            return [2 /*return*/];
                        setUploadingImg(true);
                        baseOrden = imagenes.length;
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < files.length)) return [3 /*break*/, 5];
                        return [4 /*yield*/, uploadImagen(files[i])];
                    case 2:
                        url = _b.sent();
                        if (!url) return [3 /*break*/, 4];
                        return [4 /*yield*/, supabase_1.supabase
                                .from("vlog_imagenes")
                                .insert({
                                vlog_post_id: editId,
                                url_imagen: url,
                                orden: baseOrden + i
                            })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [4 /*yield*/, loadMedia(editId)];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, load()];
                    case 7:
                        _b.sent();
                        setUploadingImg(false);
                        if (imgRef.current)
                            imgRef.current.value = "";
                        return [2 /*return*/];
                }
            });
        });
    }
    function handleVidUpload(e) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var files, baseOrden, i, url;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!editId)
                            return [2 /*return*/];
                        files = Array.from((_a = e.target.files) !== null && _a !== void 0 ? _a : []);
                        if (!files.length)
                            return [2 /*return*/];
                        setUploadingVid(true);
                        baseOrden = videos.length;
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < files.length)) return [3 /*break*/, 5];
                        return [4 /*yield*/, uploadVideo(files[i])];
                    case 2:
                        url = _b.sent();
                        if (!url) return [3 /*break*/, 4];
                        return [4 /*yield*/, supabase_1.supabase
                                .from("vlog_videos")
                                .insert({
                                vlog_post_id: editId,
                                video_url: url,
                                orden: baseOrden + i
                            })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [4 /*yield*/, loadMedia(editId)];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, load()];
                    case 7:
                        _b.sent();
                        setUploadingVid(false);
                        if (vidRef.current)
                            vidRef.current.value = "";
                        return [2 /*return*/];
                }
            });
        });
    }
    function deleteImagen(id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!confirm("¿Eliminar imagen?"))
                            return [2 /*return*/];
                        return [4 /*yield*/, supabase_1.supabase.from("vlog_imagenes")["delete"]().eq("id", id)];
                    case 1:
                        _a.sent();
                        if (!editId) return [3 /*break*/, 3];
                        return [4 /*yield*/, loadMedia(editId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, load()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function deleteVideo(id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!confirm("¿Eliminar video?"))
                            return [2 /*return*/];
                        return [4 /*yield*/, supabase_1.supabase.from("vlog_videos")["delete"]().eq("id", id)];
                    case 1:
                        _a.sent();
                        if (!editId) return [3 /*break*/, 3];
                        return [4 /*yield*/, loadMedia(editId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, load()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function save(e) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var payload, error, _e, data, error;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        e.preventDefault();
                        if (!confirm("¿Guardar estos cambios?"))
                            return [2 /*return*/];
                        if (!form.titulo.trim())
                            return [2 /*return*/, alert("Título requerido")];
                        payload = {
                            titulo: form.titulo.trim(),
                            descripcion: form.descripcion || null,
                            contenido: form.contenido || null,
                            fecha_publicacion: new Date().toISOString().split("T")[0],
                            orden: rows.length + 1,
                            activo: form.activo
                        };
                        if (!editId) return [3 /*break*/, 3];
                        return [4 /*yield*/, supabase_1.supabase
                                .from("vlog_posts")
                                .update({
                                titulo: payload.titulo,
                                descripcion: payload.descripcion,
                                contenido: payload.contenido,
                                activo: payload.activo
                            })
                                .eq("id", editId)];
                    case 1:
                        error = (_f.sent()).error;
                        if (error)
                            return [2 /*return*/, alert(error.message)];
                        cancelForm();
                        return [4 /*yield*/, load()];
                    case 2:
                        _f.sent();
                        setSuccessMsg("Post guardado correctamente");
                        setTimeout(function () { return setSuccessMsg(""); }, 3000);
                        return [3 /*break*/, 6];
                    case 3: return [4 /*yield*/, supabase_1.supabase
                            .from("vlog_posts")
                            .insert(payload)
                            .select()
                            .single()];
                    case 4:
                        _e = _f.sent(), data = _e.data, error = _e.error;
                        if (error)
                            return [2 /*return*/, alert(error.message)];
                        return [4 /*yield*/, load()];
                    case 5:
                        _f.sent();
                        setSuccessMsg("Post guardado correctamente");
                        setTimeout(function () { return setSuccessMsg(""); }, 3000);
                        setEditId(data.id);
                        setForm({
                            titulo: (_a = data.titulo) !== null && _a !== void 0 ? _a : "",
                            descripcion: (_b = data.descripcion) !== null && _b !== void 0 ? _b : "",
                            contenido: (_c = data.contenido) !== null && _c !== void 0 ? _c : "",
                            activo: (_d = data.activo) !== null && _d !== void 0 ? _d : true
                        });
                        setImagenes([]);
                        setVideos([]);
                        setShowForm(true);
                        _f.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    function onEdit(p) {
        var _a, _b, _c, _d;
        setEditId(p.id);
        setForm({
            titulo: (_a = p.titulo) !== null && _a !== void 0 ? _a : "",
            descripcion: (_b = p.descripcion) !== null && _b !== void 0 ? _b : "",
            contenido: (_c = p.contenido) !== null && _c !== void 0 ? _c : "",
            activo: (_d = p.activo) !== null && _d !== void 0 ? _d : true
        });
        loadMedia(p.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    function onDelete(id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!confirm("¿Eliminar este post? También se eliminarán sus imágenes y videos."))
                            return [2 /*return*/];
                        return [4 /*yield*/, supabase_1.supabase.from("vlog_imagenes")["delete"]().eq("vlog_post_id", id)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, supabase_1.supabase.from("vlog_videos")["delete"]().eq("vlog_post_id", id)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, supabase_1.supabase.from("vlog_posts")["delete"]().eq("id", id)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, load()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function cancelForm() {
        setEditId(null);
        setForm(initialForm);
        setShowForm(false);
        setImagenes([]);
        setVideos([]);
    }
    function onFocusInput(e) {
        e.currentTarget.style.borderColor = "#f5a623";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)";
    }
    function onBlurInput(e) {
        e.currentTarget.style.borderColor = "#ddd";
        e.currentTarget.style.boxShadow = "none";
    }
    var filtered = rows.filter(function (p) {
        return p.titulo.toLowerCase().includes(search.toLowerCase());
    });
    return (React.createElement("div", { style: {
            padding: "1.5rem 1.25rem 2.5rem",
            background: "#f8f7f4",
            minHeight: "100vh"
        } },
        successMsg && (React.createElement("div", { style: { position: "fixed", top: "1rem", right: "1rem", zIndex: 9999, background: "#16a34a", color: "#fff", padding: "0.75rem 1.25rem", borderRadius: "10px", fontWeight: 600, fontSize: "0.875rem", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: "8px" } },
            React.createElement(lucide_react_1.CheckCircle, { size: 16 }),
            " ",
            successMsg)),
        React.createElement("div", { style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
                gap: "1rem",
                flexWrap: "wrap"
            } },
            React.createElement("div", null,
                React.createElement("h1", { style: {
                        margin: 0,
                        fontSize: "1.4rem",
                        fontWeight: 700,
                        color: "#1a1a1a"
                    } }, "Blog"),
                React.createElement("p", { style: {
                        fontSize: "0.875rem",
                        color: "#888",
                        margin: "0.25rem 0 0"
                    } },
                    rows.length,
                    " publicaci\u00F3n",
                    rows.length !== 1 ? "es" : "",
                    " registrada",
                    rows.length !== 1 ? "s" : "")),
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
                savingOrder && (React.createElement("span", { style: {
                        fontSize: "0.8rem",
                        color: "#c47d00",
                        background: "#fff8e6",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontWeight: 600
                    } }, "Guardando orden...")),
                React.createElement("button", { onClick: function () {
                        setShowForm(!showForm);
                        if (showForm)
                            cancelForm();
                    }, style: {
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#f5a623",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.65rem 1.1rem",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        transition: "background 0.2s"
                    }, onMouseEnter: function (e) { return (e.currentTarget.style.background = "#d4891a"); }, onMouseLeave: function (e) { return (e.currentTarget.style.background = "#f5a623"); } }, showForm ? "✕ Cancelar" : "+ Nuevo post"))),
        showForm && (React.createElement("div", { style: {
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
                borderTop: "3px solid #f5a623"
            } },
            React.createElement("h2", { style: {
                    margin: "0 0 1.25rem",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#1a1a1a"
                } }, editId ? "Editar post" : "Nuevo post"),
            React.createElement("form", { onSubmit: save },
                React.createElement("div", { style: { marginBottom: "1rem" } },
                    React.createElement("label", { style: lbl }, "T\u00EDtulo *"),
                    React.createElement("input", { style: inp, placeholder: "T\u00EDtulo del post", value: form.titulo, onChange: function (e) { return setForm(__assign(__assign({}, form), { titulo: e.target.value })); }, onFocus: onFocusInput, onBlur: onBlurInput, required: true })),
                React.createElement("div", { style: { marginBottom: "1rem" } },
                    React.createElement("label", { style: lbl }, "Descripci\u00F3n corta"),
                    React.createElement("input", { style: inp, placeholder: "Breve descripci\u00F3n visible en la lista", value: form.descripcion, onChange: function (e) {
                            return setForm(__assign(__assign({}, form), { descripcion: e.target.value }));
                        }, onFocus: onFocusInput, onBlur: onBlurInput })),
                React.createElement("div", { style: { marginBottom: "1rem" } },
                    React.createElement("label", { style: lbl }, "Contenido"),
                    React.createElement("textarea", { style: __assign(__assign({}, inp), { minHeight: "140px", resize: "vertical" }), placeholder: "<p>Escribe el contenido completo aqu\u00ED...</p>", value: form.contenido, onChange: function (e) {
                            return setForm(__assign(__assign({}, form), { contenido: e.target.value }));
                        }, onFocus: onFocusInput, onBlur: onBlurInput })),
                React.createElement("div", { style: { marginBottom: "1.25rem" } },
                    React.createElement("label", { style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            color: "#444"
                        } },
                        React.createElement("input", { type: "checkbox", checked: form.activo, onChange: function (e) {
                                return setForm(__assign(__assign({}, form), { activo: e.target.checked }));
                            }, style: {
                                width: 16,
                                height: 16,
                                accentColor: "#f5a623",
                                cursor: "pointer"
                            } }),
                        "Activo (visible en el blog)")),
                React.createElement("div", { style: {
                        background: "#fafafa",
                        border: "1px solid #e8e8e8",
                        borderRadius: "10px",
                        padding: "1rem",
                        marginBottom: "1.25rem"
                    } },
                    React.createElement("div", { style: { marginBottom: "1rem" } },
                        React.createElement("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "0.75rem",
                                gap: "1rem",
                                flexWrap: "wrap"
                            } },
                            React.createElement("div", null,
                                React.createElement("label", { style: lbl }, "Im\u00E1genes"),
                                !editId && (React.createElement("p", { style: {
                                        margin: 0,
                                        fontSize: "0.75rem",
                                        color: "#aaa"
                                    } }, "Disponible despu\u00E9s de crear el post"))),
                            editId && (React.createElement(React.Fragment, null,
                                React.createElement("button", { type: "button", onClick: function () { var _a; return (_a = imgRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, disabled: uploadingImg, style: {
                                        background: "#eef2ff",
                                        border: "1px solid #c7d2fe",
                                        borderRadius: "8px",
                                        padding: "8px 14px",
                                        cursor: uploadingImg ? "not-allowed" : "pointer",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        color: "#4f46e5",
                                        opacity: uploadingImg ? 0.6 : 1,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        transition: "background 0.15s"
                                    }, onMouseEnter: function (e) {
                                        if (!uploadingImg)
                                            e.currentTarget.style.background = "#e0e7ff";
                                    }, onMouseLeave: function (e) {
                                        e.currentTarget.style.background = "#eef2ff";
                                    } }, uploadingImg ? (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.Loader2, { size: 14, style: { animation: "spin 1s linear infinite" } }),
                                    " ",
                                    "Subiendo...")) : (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.Upload, { size: 14 }),
                                    " Subir im\u00E1genes"))),
                                React.createElement("input", { ref: imgRef, type: "file", accept: "image/*", multiple: true, style: { display: "none" }, onChange: handleImgUpload })))),
                        editId ? (React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
                            imagenes.map(function (img) { return (React.createElement("div", { key: img.id, style: { position: "relative" } },
                                React.createElement("img", { src: img.url_imagen, alt: "", style: {
                                        width: 90,
                                        height: 90,
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                        border: "2px solid #e0e7ff",
                                        boxShadow: "0 2px 8px rgba(99,102,241,0.10)",
                                        display: "block"
                                    } }),
                                React.createElement("button", { type: "button", onClick: function () { return deleteImagen(img.id); }, style: {
                                        position: "absolute",
                                        top: -6,
                                        right: -6,
                                        background: "#dc3545",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: 20,
                                        height: 20,
                                        fontSize: "0.7rem",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.18)"
                                    } }, "\u2715"))); }),
                            imagenes.length === 0 && (React.createElement("span", { style: {
                                    fontSize: "0.8rem",
                                    color: "#bbb",
                                    padding: "8px 0"
                                } }, "Sin im\u00E1genes a\u00FAn")))) : (React.createElement("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "8px 0"
                            } },
                            React.createElement("div", { style: {
                                    width: 80,
                                    height: 80,
                                    background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                                    borderRadius: "12px",
                                    border: "1.5px dashed #a5b4fc",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6
                                } },
                                React.createElement(lucide_react_1.ImagePlus, { size: 26, color: "#818cf8", strokeWidth: 1.5 }),
                                React.createElement("span", { style: {
                                        fontSize: "0.58rem",
                                        color: "#818cf8",
                                        fontWeight: 700,
                                        letterSpacing: "0.06em",
                                        textTransform: "uppercase"
                                    } }, "Fotos")),
                            React.createElement("p", { style: { margin: 0, fontSize: "0.82rem", color: "#bbb" } },
                                "Crea el post primero y podr\u00E1s",
                                React.createElement("br", null),
                                "subir im\u00E1genes de inmediato.")))),
                    React.createElement("div", null,
                        React.createElement("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "0.75rem",
                                gap: "1rem",
                                flexWrap: "wrap"
                            } },
                            React.createElement("div", null,
                                React.createElement("label", { style: lbl }, "Videos"),
                                !editId && (React.createElement("p", { style: {
                                        margin: 0,
                                        fontSize: "0.75rem",
                                        color: "#aaa"
                                    } }, "Disponible despu\u00E9s de crear el post"))),
                            editId && (React.createElement(React.Fragment, null,
                                React.createElement("button", { type: "button", onClick: function () { var _a; return (_a = vidRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, disabled: uploadingVid, style: {
                                        background: "#f0fdf4",
                                        border: "1px solid #86efac",
                                        borderRadius: "8px",
                                        padding: "8px 14px",
                                        cursor: uploadingVid ? "not-allowed" : "pointer",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        color: "#16a34a",
                                        opacity: uploadingVid ? 0.6 : 1,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        transition: "background 0.15s"
                                    }, onMouseEnter: function (e) {
                                        if (!uploadingVid)
                                            e.currentTarget.style.background = "#dcfce7";
                                    }, onMouseLeave: function (e) {
                                        e.currentTarget.style.background = "#f0fdf4";
                                    } }, uploadingVid ? (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.Loader2, { size: 14, style: { animation: "spin 1s linear infinite" } }),
                                    " ",
                                    "Subiendo...")) : (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.Upload, { size: 14 }),
                                    " Subir videos"))),
                                React.createElement("input", { ref: vidRef, type: "file", accept: "video/*", multiple: true, style: { display: "none" }, onChange: handleVidUpload })))),
                        editId ? (React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
                            videos.map(function (vid) { return (React.createElement("div", { key: vid.id, style: { position: "relative" } },
                                React.createElement("video", { src: vid.video_url, muted: true, preload: "metadata", style: {
                                        width: 90,
                                        height: 90,
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                        border: "2px solid #bbf7d0",
                                        boxShadow: "0 2px 8px rgba(34,197,94,0.10)",
                                        display: "block"
                                    } }),
                                React.createElement("button", { type: "button", onClick: function () { return deleteVideo(vid.id); }, style: {
                                        position: "absolute",
                                        top: -6,
                                        right: -6,
                                        background: "#dc3545",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: 20,
                                        height: 20,
                                        fontSize: "0.7rem",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.18)"
                                    } }, "\u2715"))); }),
                            videos.length === 0 && (React.createElement("span", { style: {
                                    fontSize: "0.8rem",
                                    color: "#bbb",
                                    padding: "8px 0"
                                } }, "Sin videos a\u00FAn")))) : (React.createElement("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "8px 0"
                            } },
                            React.createElement("div", { style: {
                                    width: 80,
                                    height: 80,
                                    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                                    borderRadius: "12px",
                                    border: "1.5px dashed #86efac",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6
                                } },
                                React.createElement(lucide_react_1.VideoIcon, { size: 26, color: "#4ade80", strokeWidth: 1.5 }),
                                React.createElement("span", { style: {
                                        fontSize: "0.58rem",
                                        color: "#4ade80",
                                        fontWeight: 700,
                                        letterSpacing: "0.06em",
                                        textTransform: "uppercase"
                                    } }, "Video")),
                            React.createElement("p", { style: { margin: 0, fontSize: "0.82rem", color: "#bbb" } },
                                "Crea el post primero y podr\u00E1s",
                                React.createElement("br", null),
                                "subir videos de inmediato."))))),
                React.createElement("div", { style: { display: "flex", gap: "10px" } },
                    React.createElement("button", { type: "submit", style: {
                            background: "#f5a623",
                            color: "#fff",
                            border: "none",
                            padding: "0.65rem 1.4rem",
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            transition: "background 0.2s"
                        }, onMouseEnter: function (e) {
                            return (e.currentTarget.style.background = "#d4891a");
                        }, onMouseLeave: function (e) {
                            return (e.currentTarget.style.background = "#f5a623");
                        } }, editId ? "Guardar cambios" : "Crear post"),
                    React.createElement("button", { type: "button", onClick: cancelForm, style: {
                            padding: "0.65rem 1.2rem",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0",
                            background: "#fff",
                            color: "#555",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            cursor: "pointer"
                        } }, "Cancelar"))))),
        !showForm && (React.createElement(React.Fragment, null,
            React.createElement("div", { style: { marginBottom: "1rem" } },
                React.createElement("input", { style: __assign(__assign({}, inp), { maxWidth: 380 }), placeholder: "Buscar por t\u00EDtulo...", value: search, onChange: function (e) { return setSearch(e.target.value); }, onFocus: onFocusInput, onBlur: onBlurInput })),
            loading ? (React.createElement("div", { style: { textAlign: "center", padding: "3rem", color: "#aaa" } }, "Cargando posts...")) : (React.createElement("div", { style: {
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #e8e8e8",
                    overflow: "hidden"
                } },
                React.createElement("div", { style: {
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch"
                    } },
                    React.createElement("table", { style: {
                            width: "100%",
                            borderCollapse: "collapse",
                            minWidth: 700
                        } },
                        React.createElement("thead", null,
                            React.createElement("tr", { style: {
                                    background: "#fafafa",
                                    borderBottom: "1px solid #e8e8e8"
                                } }, [
                                "Título",
                                "Descripción",
                                "Fecha",
                                "Orden",
                                "Imágenes",
                                "Videos",
                                "Estado",
                                "Acciones",
                            ].map(function (h) { return (React.createElement("th", { key: h, style: {
                                    padding: "0.85rem 1rem",
                                    textAlign: "left",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "#888",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    whiteSpace: "nowrap"
                                } }, h)); }))),
                        React.createElement("tbody", null, filtered.length === 0 ? (React.createElement("tr", null,
                            React.createElement("td", { colSpan: 8, style: {
                                    padding: "3rem",
                                    textAlign: "center",
                                    color: "#aaa"
                                } }, search ? "Sin resultados" : "No hay posts aún"))) : (filtered.map(function (p, i) {
                            var _a;
                            var media = (_a = mediaMap[p.id]) !== null && _a !== void 0 ? _a : { imgs: 0, vids: 0 };
                            return (React.createElement("tr", { key: p.id, style: {
                                    borderBottom: i < filtered.length - 1
                                        ? "1px solid #f0f0f0"
                                        : "none"
                                } },
                                React.createElement("td", { style: {
                                        padding: "0.9rem 1rem",
                                        fontWeight: 600,
                                        color: "#1a1a1a",
                                        fontSize: "0.9rem",
                                        maxWidth: 180
                                    } },
                                    React.createElement("span", { style: {
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            display: "block"
                                        } }, p.titulo)),
                                React.createElement("td", { style: {
                                        padding: "0.9rem 1rem",
                                        color: "#555",
                                        fontSize: "0.875rem",
                                        maxWidth: 200
                                    } },
                                    React.createElement("span", { style: {
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            display: "block"
                                        } }, p.descripcion || (React.createElement("span", { style: { color: "#ccc" } }, "\u2014")))),
                                React.createElement("td", { style: {
                                        padding: "0.9rem 1rem",
                                        color: "#666",
                                        fontSize: "0.85rem",
                                        whiteSpace: "nowrap"
                                    } }, new Date(p.fecha_publicacion).toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                })),
                                React.createElement("td", { style: {
                                        padding: "0.6rem 1rem",
                                        textAlign: "center"
                                    } },
                                    React.createElement("div", { style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6
                                        } },
                                        React.createElement("button", { type: "button", onClick: function () { return moveUp(i); }, disabled: i === 0 || savingOrder, title: "Subir", style: {
                                                width: 26,
                                                height: 26,
                                                borderRadius: 6,
                                                border: "1px solid #e2e2e2",
                                                background: "#fff",
                                                cursor: i === 0 || savingOrder
                                                    ? "not-allowed"
                                                    : "pointer",
                                                opacity: i === 0 || savingOrder ? 0.35 : 1,
                                                fontWeight: 700,
                                                color: "#666",
                                                fontSize: "0.85rem",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "background 0.15s"
                                            } }, "\u2191"),
                                        React.createElement("span", { style: {
                                                minWidth: 20,
                                                textAlign: "center",
                                                fontWeight: 700,
                                                color: "#555",
                                                fontSize: "0.85rem"
                                            } }, p.orden),
                                        React.createElement("button", { type: "button", onClick: function () { return moveDown(i); }, disabled: i === rows.length - 1 || savingOrder, title: "Bajar", style: {
                                                width: 26,
                                                height: 26,
                                                borderRadius: 6,
                                                border: "1px solid #e2e2e2",
                                                background: "#fff",
                                                cursor: i === rows.length - 1 || savingOrder
                                                    ? "not-allowed"
                                                    : "pointer",
                                                opacity: i === rows.length - 1 || savingOrder
                                                    ? 0.35
                                                    : 1,
                                                fontWeight: 700,
                                                color: "#666",
                                                fontSize: "0.85rem",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "background 0.15s"
                                            } }, "\u2193"))),
                                React.createElement("td", { style: {
                                        padding: "0.9rem 1rem",
                                        textAlign: "center"
                                    } }, media.imgs > 0 ? (React.createElement("span", { style: {
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        padding: "3px 10px",
                                        borderRadius: "999px",
                                        fontSize: "0.78rem",
                                        fontWeight: 700,
                                        background: "#eef2ff",
                                        color: "#4f46e5",
                                        whiteSpace: "nowrap"
                                    } },
                                    React.createElement(lucide_react_1.ImagePlus, { size: 12, strokeWidth: 2 }),
                                    " ",
                                    media.imgs)) : (React.createElement("span", { style: {
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        padding: "3px 10px",
                                        borderRadius: "999px",
                                        fontSize: "0.78rem",
                                        fontWeight: 600,
                                        background: "#f5f5f5",
                                        color: "#ccc",
                                        whiteSpace: "nowrap"
                                    } },
                                    React.createElement(lucide_react_1.ImageOff, { size: 12, strokeWidth: 1.5 }),
                                    " Sin fotos"))),
                                React.createElement("td", { style: {
                                        padding: "0.9rem 1rem",
                                        textAlign: "center"
                                    } }, media.vids > 0 ? (React.createElement("span", { style: {
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        padding: "3px 10px",
                                        borderRadius: "999px",
                                        fontSize: "0.78rem",
                                        fontWeight: 700,
                                        background: "#f0fdf4",
                                        color: "#16a34a",
                                        whiteSpace: "nowrap"
                                    } },
                                    React.createElement(lucide_react_1.VideoIcon, { size: 12, strokeWidth: 2 }),
                                    " ",
                                    media.vids)) : (React.createElement("span", { style: {
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        padding: "3px 10px",
                                        borderRadius: "999px",
                                        fontSize: "0.78rem",
                                        fontWeight: 600,
                                        background: "#f5f5f5",
                                        color: "#ccc",
                                        whiteSpace: "nowrap"
                                    } },
                                    React.createElement(lucide_react_1.VideoOff, { size: 12, strokeWidth: 1.5 }),
                                    " Sin videos"))),
                                React.createElement("td", { style: { padding: "0.9rem 1rem" } },
                                    React.createElement("span", { style: {
                                            display: "inline-flex",
                                            alignItems: "center",
                                            padding: "3px 10px",
                                            borderRadius: "999px",
                                            fontSize: "0.78rem",
                                            fontWeight: 600,
                                            whiteSpace: "nowrap",
                                            background: p.activo
                                                ? "rgba(34,197,94,0.1)"
                                                : "rgba(239,68,68,0.1)",
                                            color: p.activo ? "#16a34a" : "#dc2626"
                                        } }, p.activo ? "Activo" : "Inactivo")),
                                React.createElement("td", { style: { padding: "0.9rem 1rem" } },
                                    React.createElement("div", { style: { display: "flex", gap: "6px" } },
                                        React.createElement("button", { onClick: function () { return onEdit(p); }, title: "Editar", style: {
                                                background: "rgba(245,166,35,0.1)",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "6px",
                                                cursor: "pointer",
                                                color: "#f5a623",
                                                display: "flex",
                                                transition: "background 0.2s"
                                            }, onMouseEnter: function (e) {
                                                return (e.currentTarget.style.background =
                                                    "rgba(245,166,35,0.2)");
                                            }, onMouseLeave: function (e) {
                                                return (e.currentTarget.style.background =
                                                    "rgba(245,166,35,0.1)");
                                            } },
                                            React.createElement(lucide_react_1.Pencil, { size: 15 })),
                                        React.createElement("button", { onClick: function () { return onDelete(p.id); }, title: "Eliminar", style: {
                                                background: "rgba(220,38,38,0.08)",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "6px",
                                                cursor: "pointer",
                                                color: "#dc2626",
                                                display: "flex",
                                                transition: "background 0.2s"
                                            }, onMouseEnter: function (e) {
                                                return (e.currentTarget.style.background =
                                                    "rgba(220,38,38,0.18)");
                                            }, onMouseLeave: function (e) {
                                                return (e.currentTarget.style.background =
                                                    "rgba(220,38,38,0.08)");
                                            } },
                                            React.createElement(lucide_react_1.Trash2, { size: 15 }))))));
                        }))))),
                React.createElement("div", { style: {
                        padding: "12px 16px",
                        borderTop: "1px solid #e8e8e8",
                        background: "#fafafa",
                        fontSize: "0.8rem",
                        color: "#aaa"
                    } },
                    filtered.length,
                    " de ",
                    rows.length,
                    " publicaci\u00F3n",
                    rows.length !== 1 ? "es" : ""))))),
        React.createElement("style", null, "\n        @keyframes spin {\n          from { transform: rotate(0deg); }\n          to   { transform: rotate(360deg); }\n        }\n      ")));
}
exports["default"] = AdminBlogPage;
