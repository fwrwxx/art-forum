const Book = require('../models/Book');
const cacheService = require('../services/cacheService');

// @desc    Get all books with pagination
const getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const genre = req.query.genre;

    const cacheKey = `books:page:${page}:limit:${limit}:genre:${genre}`;
    
    // Check cache
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({
        source: 'cache',
        data: cachedData,
      });
    }

    // Build query
    let query = {};
    if (genre) query.genre = genre;

    // Перевірка чи є підключення до БД
    let books = [];
    let total = 0;
    
    try {
      books = await Book.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(); // lean() для кращої продуктивності

      total = await Book.countDocuments(query);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Якщо помилка БД, повертаємо порожній масив
      books = [];
      total = 0;
    }

    const result = {
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, result, 300);

    res.json({
      source: 'database',
      data: result,
    });
  } catch (error) {
    console.error('getBooks error:', error);
    res.status(500).json({ 
      message: 'Error fetching books', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get single book
const getBookById = async (req, res) => {
  try {
    const cacheKey = `book:${req.params.id}`;
    const cachedBook = await cacheService.get(cacheKey);

    if (cachedBook) {
      return res.json({ source: 'cache', data: cachedBook });
    }

    const book = await Book.findById(req.params.id).lean();
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await cacheService.set(cacheKey, book, 600);
    res.json({ source: 'database', data: book });
  } catch (error) {
    console.error('getBookById error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create book
const createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    await cacheService.delByPattern('books:*');
    res.status(201).json(book);
  } catch (error) {
    console.error('createBook error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update book
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await cacheService.del(`book:${req.params.id}`);
    await cacheService.delByPattern('books:*');
    
    res.json(book);
  } catch (error) {
    console.error('updateBook error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete book
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await cacheService.del(`book:${req.params.id}`);
    await cacheService.delByPattern('books:*');
    
    res.json({ message: 'Book removed' });
  } catch (error) {
    console.error('deleteBook error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};