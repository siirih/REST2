const express = require("express");
const fs = require("fs");
const app = express();

const port = 5000;

let sanakirja = [];

const data = fs.readFileSync("./sanakirja.txt", {
  encoding: "utf8",
  flag: "r",
});

const splitLines = data.split(/\r?\n/);

splitLines.forEach((line) => {
  const sanat = line.split(" ");

  const sana = {
    fin: sanat[0],
    eng: sanat[1],
  };

  sanakirja.push(sana);
});

console.log(sanakirja);

app.use(express.json()); //käytetään json -muotoista dataa
app.use(express.urlencoded({ extended: true })); //käytetään tiedonsiirrossa laajennettua muotoa

//CORS -määrittely
app.use((req, res, next) => {
  //website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");
  //request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  //request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
  );
  //set to true if you need the website to include cookies in the request sent
  //to the API (e.g. in case you use session)
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Content-type", "application/json");

  next();
});
//GET koko sanakirja
app.get("/sanakirja", (req, res) => {
  res.json(sanakirja);
});
//GET englannin kielinen sana
app.get("/sanakirja/:fin", (req, res) => {
  const fin = req.params.fin;
  const eng = sanakirja.find((sana) => sana.fin === fin);
  if (eng) {
    res.json({ eng: eng.eng });
  } else {
    res.json({ message: "Ei löydy" });
  }
});
//ADD sanapari
app.post("/sanakirja", (req, res) => {
  const fin = req.body.fin;
  const eng = req.body.eng;
  if (!fin || !eng) {
    return res.status(400).json({
      message: "Suomenkielinen ja englanninkielinen sana ovat pakollisia.",
    });
  }
  const sanapari = {
    fin: fin,
    eng: eng,
  };
  sanakirja.push(sanapari);
  fs.appendFileSync(
    "sanakirja.txt",
    `\n${fin} ${eng}`,
    { encoding: "utf8" },
    { flags: "a" }
  );
  res.status(201).json({
    message: "Sana lisätty onnistuneesti",
    updatedDictionary: sanakirja,
  });
});

app.listen(port, () => {
  console.log(`Kuunnellaan portissa ${port}`);
});
