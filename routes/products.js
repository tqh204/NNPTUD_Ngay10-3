var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products')

// ==================== READ ALL ====================
// GET /api/v1/products - Lấy tất cả products (không xóa mềm - chỉ các product còn tồn tại)
router.get('/', async function(req, res, next) {
  try {
    let result = await productModel.find({ isDeleted: false }).populate('category');
    res.json({
      success: true,
      message: 'Lấy danh sách products thành công',
      data: result,
      count: result.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách products',
      error: error.message
    });
  }
});

// ==================== READ ONE ====================
// GET /api/v1/products/:id - Lấy chi tiết 1 product
router.get('/:id', async function(req, res, next) {
  try {
    let result = await productModel.findById(req.params.id).populate('category');
    
    if (!result || result.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product không tồn tại'
      });
    }
    
    res.json({
      success: true,
      message: 'Lấy chi tiết product thành công',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết product',
      error: error.message
    });
  }
});

// ==================== CREATE ====================
// POST /api/v1/products - Tạo product mới
router.post('/', async function(req, res, next) {
  try {
    const { title, slug, price, description, images, category } = req.body;
    
    // Validation
    if (!title || !slug || !category) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin (title, slug, category)',
      });
    }

    let newProduct = new productModel({
      title,
      slug,
      price: price || 0,
      description: description || '',
      images: images || ['https://i.imgur.com/ZANVnHE.jpeg'],
      category,
      isDeleted: false
    });

    let result = await newProduct.save();
    await result.populate('category');

    res.status(201).json({
      success: true,
      message: 'Tạo product thành công',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Lỗi khi tạo product',
      error: error.message
    });
  }
});

// ==================== UPDATE ====================
// PUT /api/v1/products/:id - Cập nhật product
router.put('/:id', async function(req, res, next) {
  try {
    const { title, slug, price, description, images, category } = req.body;
    
    let product = await productModel.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product không tồn tại'
      });
    }

    // Cập nhật các trường
    if (title) product.title = title;
    if (slug) product.slug = slug;
    if (price !== undefined) product.price = price;
    if (description) product.description = description;
    if (images) product.images = images;
    if (category) product.category = category;

    let result = await product.save();
    await result.populate('category');

    res.json({
      success: true,
      message: 'Cập nhật product thành công',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Lỗi khi cập nhật product',
      error: error.message
    });
  }
});

// ==================== DELETE ====================
// DELETE /api/v1/products/:id - Xóa mềm product (isDeleted = true)
router.delete('/:id', async function(req, res, next) {
  try {
    let product = await productModel.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product không tồn tại'
      });
    }

    product.isDeleted = true;
    await product.save();

    res.json({
      success: true,
      message: 'Xóa product thành công',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa product',
      error: error.message
    });
  }
});

module.exports = router;
