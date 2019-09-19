var middlewareObj = {};
var path = require('path')
var multer = require('multer');
const csv = require('csv-parser')
const fs = require('fs')
let csvspec = []

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
})


middlewareObj.upload = multer({
    storage: storage
});

middlewareObj.csvspec = (req, res, next) => {
    console.log(req.query.url)
    fs.createReadStream('./public/uploads/' + req.query.url)
        .pipe(csv())
        .on('headers', (headers) => {
            // console.log(headers.map(k => k))
            headers.forEach(header => {
                let obj = {}
                obj['datatype'] = typeof (header) == 'string' ? 'NVARCHAR(100)' : 'BIGINT'
                obj['nullable'] = 'true'
                obj['name'] = (header + '_').replace(/ /g, "_");
                obj['description'] = header
                obj['label'] = header
                obj['usage'] = header == 'age' ? 'identifier' : 'fact'
                obj['regularAggregate'] = typeof (header) == 'string' ? 'countDistinct' : 'total'
                csvspec.push(obj)

            });
            res.json(csvspec)
            csvspec = []
        })
}


module.exports = middlewareObj;