const express = require(`express`);
const expressLayouts = require(`express-ejs-layouts`);

const { body, validationResult, check } = require(`express-validator`);

const session = require(`express-session`);
const cookieParser = require(`cookie-parser`);
const flash = require(`connect-flash`);

require(`./utils/db`);
const Contact = require(`./model/contact`);

const app = express();
const port = 3000;

// Setup EJS
app.set(`view engine`, `ejs`);
app.use(expressLayouts);
app.use(express.static(`public`));
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser(`secret`));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: `secret`,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// halaman Home
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: `Septian`,
      email: `albasit@gmail.com`,
    },
    {
      nama: `Seli`,
      email: `seli@gmail.com`,
    },
  ];
  res.render(`index`, {
    layout: `layout/mainLayout`,
    nama: `Albasits`,
    judul: `Welcome Home`,
    mahasiswa,
    title: `Welcome Home`,
  });
});

// untuk pergi ke halaman about
app.get(`/about`, (req, res) => {
  res.render(`about`, {
    title: `About Page`,
    layout: `layout/mainLayout`,
  });
});

// untuk pergi ke halaman contact
app.get(`/contact`, async (req, res) => {
  const contacts = await Contact.find();

  res.render(`contact`, {
    title: `Contact Page`,
    layout: `layout/mainLayout`,
    contacts,
    msg: req.flash(`msg`),
  });
});

// halaman form tambah contact
app.get(`/contact/add`, (req, res) => {
  res.render(`add-contact`, {
    title: `Add New Contact Page`,
    layout: `layout/mainLayout`,
  });
});

// Proses tambah data contact
app.post(
  `/contact`,
  [
    body(`nama`).custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error(`Name Already Registered!`);
      }
      return true;
    }),
    check(`email`, `Invalid Email Format!`).isEmail(),
    check(`nohp`, `Invalid Phone Number (id-ID)!`).isMobilePhone(`id-ID`),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render(`add-contact`, {
        title: `Form Add Contact`,
        layout: `layout/mainLayout`,
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        // kirimkan flash message
        req.flash(`msg`, `contact added successfully!`);
        res.redirect(`/contact`);
      });
    }
  }
);

// halaman detail contact
app.get(`/contact/:nama`, async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render(`detail`, {
    title: `Detail Contact Page`,
    layout: `layout/mainLayout`,
    contact,
  });
});

app.listen(port, () => {
  console.log(`Mongo Contact app | Listening at http://localhost:${port}`);
});
