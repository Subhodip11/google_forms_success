const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const multer = require('multer');
const { render } = require('ejs');
const { Store } = require('express-session');

mongoose.connect('mongodb+srv://Subhodip12:vvNH349bQKl0eldj@walmartcluster.qcmkn.mongodb.net/forms?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDb connected')
}).catch(err => {
    console.log(err);
})

let formData = new mongoose.Schema({
    name_personal: String,
    name_club: String,
    link: String,
    contact: Number,
    coordinator_name: String,
    admin_name: String,
    description: String,
    imgURL: String
});

let data = mongoose.model('myFroms', formData);

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.use(express.static('public'));

let storage = multer.diskStorage({
    destination: './public/uploads/images',
    filename: (req, file, cb) => {
        return cb(null, file.originalname);
    }
})

let file = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        let filetype = /jpeg|jpg|png|gif/;
        let checkfiletype = filetype.test(path.extname(file.originalname).toLowerCase());
        if (!checkfiletype) {
            return cb('Error : Please Select Images only')
        }

        cb(null, 'File uploaded successfully');
    }
})

app.get('/myForms', (req, res) => {
    res.render('survey');
})

app.get('/myForms/submissionSuccess', (req, res) => {
    data.find({}).then(data => {
        // console.log(data);
    }).catch(err => {
        return console.log(err);
    })
    res.render('submition');
})

app.get('/admin/myForm', (req, res) => {
    data.find({})
        .then(data => {
            res.render('submitDetails', { data: data });
        })
        .catch(err => {
            console.log(err);
        })
})

app.post('/myForm/edit/:id', (req, res) => {
    let id = { _id: req.params.id };
    data.findOne(id).then(data => {
        res.redirect('/admin/myForm/Details' + data.id);
    }).catch(err => {
        console.log(err);
    })
})


app.post('/myFormSuccess', file.single('File-name'), (req, res) => {

    let file = req.file;
    if (!file) {
        return console.log('The selected file is not a image');
    }
    fileType = file.path.replace('public', '');
    let obj = {
        name_personal: req.body.Name_Personal,
        name_club: req.body.Name_Club,
        link: req.body.Link,
        contact: req.body.Contact,
        coordinator_name: req.body.Coordinator_Name,
        admin_name: req.body.Admin_Name,
        description: req.body.Description,
        imgURL: fileType
    }
    data.create(obj).then(data => {
        res.redirect('/myForms/submissionSuccess')
    }).catch(err => {
        console.log(err);
    })
})

app.delete('/admin/myFrom/deleteData:id', (req, res) => {
    let id = req.params.id;
    data.deleteOne({ _id: id })
        .then(data => {
            res.redirect('/admin/myForm');
        }).catch(err => {
            console.log(err);
        })
})
let url = "";
app.put('/admin/myForm/edit/:id', file.single('File-update'), (req, res) => {
    let file = req.file;
    if (!file) {
        return console.log("Please select images only");
    }
    let fileType = file.path.replace('public', '');
    let details = {
        name_personal: req.body.name_personal,
        name_club: req.body.name_club,
        link: req.body.link,
        contact: req.body.contact,
        coordinator_name: req.body.coordinator_name,
        admin_name: req.body.admin_name,
        description: req.body.description,
        imgURL: fileType
    }
    let id = { _id: req.params.id };
    data.updateOne(id, {
        $set: details
    }).then(data => {
        console.log(data);
        res.redirect('/admin/myForm');
    }).catch(err => {
        console.log(err);
    })
})

app.get('/admin/myForm/Details:id', (req, res) => {
    let id = { _id: req.params.id };
    data.findOne(id).then(data => {
        res.render('checked', { data: data });
    }).catch(err => {
        console.log(err)
    })
})

app.listen(2233, () => {
    console.log('Server has started listening at 2233');
})