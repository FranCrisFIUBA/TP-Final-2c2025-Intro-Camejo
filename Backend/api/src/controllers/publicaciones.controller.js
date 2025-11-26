import * as service from "../services/publicaciones.service.js";

export const getPublicaciones = async (req, res) => {
  try {
    const data = await service.getPublicaciones();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPublicacionById = async (req, res) => {
  try {
    const data = await service.getPublicacionById(req.params.id);
    if (!data) return res.status(404).json({ error: "Publicación no encontrada" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPublicacion = async (req, res) => {
  try {
    const data = await service.createPublicacion(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePublicacion = async (req, res) => {
  try {
    const data = await service.updatePublicacion(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePublicacion = async (req, res) => {
  try {
    await service.deletePublicacion(req.params.id);
    res.json({ message: "Publicación eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
