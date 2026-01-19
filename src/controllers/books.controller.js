const {freeComBooks} = require("../services/books.service");

exports.getAllCategory = async(req, res) => {
    try {
        const result = await freeComBooks.getAllCategory();
        res.json(result);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}
exports.getSubCategory = async(req, res) => {
    try {
        const result = await freeComBooks.getSubCategory(req.query.categoryPath);
        res.json(result);
    } catch (error) {
        res.status(500).json({error: error.message});
    }

    
}

exports.getBookByCategory = async(req, res) => {
    try {
        const result = await freeComBooks.getBookByCategory(req.query.subCategoryPath);
        res.json(result);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

exports.getDetailsBook = async(req, res) => {
    try {
        const result = await freeComBooks.getBookDetail(req.query.bookPath);
        res.json(result);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}


