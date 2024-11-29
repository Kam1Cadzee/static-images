import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import str from './str';
import intersection from 'lodash.intersection';
import doc from './statistic/29.09.2024.json';
import cors from 'cors';

var app = express();
const allowedOrigins = [
  'http://localhost:3006',
  'http://192.168.31.188:3006',
  'http://localhost:3001',
  'http://192.168.31.65',
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Origin is allowed
    } else {
      callback(new Error('CORS not allowed for this origin')); // Origin is not allowed
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
// app.use(function (req, res, next) {
//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   // Request methods you wish to allow
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'GET, POST, OPTIONS, PUT, PATCH, DELETE',
//   );

//   // Request headers you wish to allow
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'X-Requested-With,content-type',
//   );

//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', 'true');

//   // Pass to next layer of middleware
//   next();
// });

var server = http.createServer(app);

app.get('/statistic/:date', async function (req, res) {
  var public_path = path.join(__dirname, 'statistic');
  const { date } = req.params;

  const data = await test(date);

  try {
    res.send(data);
  } catch (e) {
    console.log(e);
    res.send([]);
  }
});
app.get('/json/:date', function (req, res) {
  var public_path = path.join(__dirname, 'json');
  const { date } = req.params;

  try {
    res.sendFile(`${public_path}/${date}.json`);
  } catch (e) {
    console.log(e);
    res.send([]);
  }
});
app.get('/json/:date/:time/:isFarm/:mc', async function (req, res) {
  const { date, time, isFarm, mc } = req.params;

  const data = await test(date, +time, isFarm === 'true', +mc);

  try {
    res.send(data);
  } catch (e) {
    console.log(e);
    res.send([]);
  }
});

app.get('/vanya/:id/:date', function (req, res) {
  var public_path = path.join(__dirname, 'public');
  const { id, date } = req.params;

  try {
    const ext = ['jpeg', 'gif', 'png', 'jpg'];

    for (let i = 0; i < ext.length; i += 1) {
      const full_path = `${public_path}/${date}/${id}.${ext[i]}`;

      if (fs.existsSync(full_path)) {
        return res.sendFile(full_path);
      }
    }
    res.sendFile(`${public_path}/17.08.2024/1.jpeg`);
  } catch (e) {
    console.log(e);
  }
});

app.get('/files/:id/:date', function (req, res) {
  var public_path = path.join(__dirname, 'tokens');
  const { id, date } = req.params;

  try {
    const ext = ['jpeg', 'gif', 'png', 'jpg'];

    for (let i = 0; i < ext.length; i += 1) {
      const full_path = `${public_path}/${date}/${id}.${ext[i]}`;

      if (fs.existsSync(full_path)) {
        return res.sendFile(full_path);
      }
    }
    res.sendFile(`${public_path}/17.08.2024/1.jpeg`);
  } catch (e) {
    console.log(e);
  }
});

app.get('/memes/:id', function (req, res) {
  var public_path = path.join(__dirname, 'meme');
  const { id } = req.params;

  try {
    const ext = ['jpeg', 'gif', 'png', 'jpg'];

    for (let i = 0; i < ext.length; i += 1) {
      const full_path = `${public_path}/${id}.${ext[i]}`;

      if (fs.existsSync(full_path)) {
        return res.sendFile(full_path);
      }
    }
    res.sendFile(`${public_path}/17.08.2024/1.jpeg`);
  } catch (e) {
    console.log(e);
  }
});

app.get('/meta/:mc', async function (req, res) {
  var public_path = path.join(__dirname, 'meme');
  const { mc } = req.params;

  try {
    res.send(await monitoringMeta(+(mc ?? 38)));
  } catch (e) {
    console.log(e);
  }
});

console.log('listen to 3001');
server.listen(3001);

type Statistic = {
  creation: number;
  mc: number;
  buys: number;
  sells: number;
  mint: string;
  isFarm: boolean;
  traders: string[];
  name: string;
  symbol: string;
};

const getCurrentJson = async () => {
  const d = new Date();
  const nameFile = `${d.getDate().toString().padStart(2, '0')}.${(
    d.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}.${d.getFullYear().toString()}`;

  return getJSON(nameFile);
};

const getJSON = async (name: string) => {
  const public_path = path.join(__dirname, 'statistic');
  const url = `${public_path}/${name}.json`;

  if (!fs.existsSync(url)) {
    return [];
  }
  try {
    const data: Statistic[] = JSON.parse(
      (await fs.promises.readFile(url)).toString(),
    );
    return data;
  } catch {
    return [];
  }
};

const staticTraders = [
  'X1C2Qt6NZc7EpnJ3hEXPVkTrxJX1Z47CdWCkxbobogA',
  '8uNLyuofKQU2SDuRsXoiEcEcZBX8mWQwQn485ymL7DUF',
  'X8vpCehdmhqBAN7DJyHiFG7tenTuum7KgUDmq1UrzGM',
  'suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK',
  'FRv2fq7qgUwFC5DPoJexq565yAAMXpnPry1fNXCtiUKi',
  '4b2KDL2h1K3CBFQ77MLcgZVogq9W7y4jxCpZgeq1yHRx',
  'GDkpZYxTbJYdvxnhYGig46T4WrZAp1gTSk7cvZfnXd9u',
  '2L6t61zYN548n59VoHFK221DsQSKGn6JRMhkmwosUcSt',
  'C5ApZQhkXHTo3guW8YRmjsvQJnZ2VEMH1dJTtFHo77ar',
  '2UjWvWgSrDxAVBe7gE8L4jmSKfpH9RBXcedLLzuBRYTn',
  'ChrQxKbLdV1Afk5vRWjzYuutCid9PdrnYizwX5oZnxGu',
  '2La56oUHV7wTcHUDH4yFwrmnwdZDH2G43ipumaZUKDQS',
  'AJXbFnqQc4sSPehZb4srjtFNweS19QiQ2W5gYqK56Tdg',
  'BSDoPducfAba7GHxp3TkQW2v7PnRNdjQDgCumsdtsdSf',
  '5dFWqsyZHnaYXFcPegCm9GwMGtX384X9bGGEe9opQGCZ',
  '2egyyfk5Zbit7vnJC28MqKaGSBWLxxdcZj9Wxmi8fuvj',
  'EgF1SoQFYnW6bR4bNCkMx5bkwjvjNDxY3YgwJkoQUz7z',
  'Dw31au4DcQSbphaUgoKKV4FVaDn72HCFBATrLi5iywsN',
  '2UjWvWgSrDxAVBe7gE8L4jmSKfpH9RBXcedLLzuBRYTn',
  '9R2UJG1Wyoo5V376TKkHcp98hrKEQhmGMmx8jVtRLJoz',
  'Aiub9GyRiYMbP1PqFTaZiYwdWj3mjGgFN1eWwaCAVRqU',
  'DzDN9HKpM2syPHz9bLxLzx5ee7MvHcW5CgpYRKcy5T4V',
  'HcnutbkSQTwWutqn15XGvSB4jATpQbRxMGzm7sK4ecaT',
  '696969Y6orZEjp4gZtwcCZS7TNVuhMVE6G5mFvdJ4mYq',
  'DhtZrHkw85GCxvkzpSNWTisUf7xZViwdRk1Yoz7APv4R',
  '3q5LFWFkcH7TWNxBLb4iTwcYrwqKVTZZ4ibDT7Zo2x4f',
  'DuHzFrXTb5Kh3Dt1XuDvDi5zRiant6yn84yFTf2z6A5p',
  'zVaDHVZS8rW39oifTotXwA5g57oAANaHpzi3XuNYcwY',
  '5fS8Ydr6mwGWKg67Kf4BtSe8mFuVk1khk47yrs48MsMM',
  'B55PH2b2mJjQpQShcwuaNFSp4LcARJqwx14tqtyhVRc3',
  '9NNS758mUGByRcFBSD79fLn2mYL3PGM9G9J5RjBV3kD4',
  '9R2UJG1Wyoo5V376TKkHcp98hrKEQhmGMmx8jVtRLJoz',
  'Bo49axa2owmnz64undmFnv5dskpUhntezcvWSwZRv2si',
  '9FNz4MjPUmnJqTf6yEDbL1D4SsHVh7uA8zRHhR5K138r',
  'BtDaZUqHr2mKH5EYQCztuerHBuBEfQNYdquTDtEZp2Ym',
  'BxHhQ5U4sqAupnUkTdCqLGqsHmBFyuWbcBrjSgSHpdte',
  '757Cw6zsYkc5mb3CAwoMf4nUNZ3CgCTEN87BvfYxY9Qi',
  'Hd9HKLie1nKXx4zLQXg9WVYyK95kBFEC7bj1aGwRtBqF',
  'FAHx7CHFiT2Li1xw9KMxMi8xFvaLwfpmL8yqrmWSP3JX',
  'AiLwAtCzPnQh6GnJ1UiMi9vqNniV3QyTM4rueKYNjPwN',
  '77KT63Uah7rystfHPjFhEAbBq9i7Y6ksKGRRPS5fwpVm',
  '846aYtBLTvHmyGo3icTrYqPwV8K9wWGkuMvTYL211mXX',
  'Hd9HKLie1nKXx4zLQXg9WVYyK95kBFEC7bj1aGwRtBqF',
  '3q1Fw2sFQz6EW1T4wEjSFsozqXw1gmmH2eveyq8aUTJ2',
  'CRVidEDtEUTYZisCxBZkpELzhQc9eauMLR3FWg74tReL',
  '62XyB5PHNZKBvhWSAdc6d1mk1gpA7RMcFt7vAYbwYqaG',
  'HMR6GuzH9cAWFqas3FUoNvXH1guEWH4AC1zy7JJYWN3V',
  '3vZz5oEYbYSZ7b45BvpytfqJLmA6jaSzkbNf3dyMYKVK',
  '5FS97TvWTHjUn3mkR47XBZmCfBmcWHDuk7mp3bLbNAJF',
  '69tfTzAH4C2Jtsmcjpkk4XVzPvV5Trw3tvxkdzASrZ1d',
  '9v9Xsxxu2pi4cDkTHtyL1Rg417uga48R2VcCP4L1Pe9R',
  'HX9JH8wNjS2ayes6eGhFgNuEzkDAhKVWrXvY3g3waPRc',
  'AYht6oyGh1sP3eQejmwYFtFZb6zuZbaEo9fJM8FS3sWz',
  '5qzJuLUukqai5Qn64wxTdZtS6eDee7sjvgtU2wvRmkrm',
  '2aEUVksWqox6WqdPeZY9aTUqbjmbKxzc6GiYXFzpTEQj',
  'GQjqD9hKAGP7nTsRdisgQszaGUj69ch1FMxdBUjo9ZVj',
  'DMqibTACAF4piJjA92Kuim7pxzuNGFizmuZ5KTtttnx8',
  'rRzP4nxsTi7V2jBpzpcMRdowRZHbUr7LpmCFQGrMM2U',
  'B29fP7HACmz4FkAPVCX14MyqWz4QMtuC24zRZcvPzE32',
  '8i57XsS3E4iuw2qy2cPbKDWnW4pwx6yaBc7N7UQzG3MJ',
  '6GV8d2vexSMg76Ap5kJeKw4x8w5QyuifLGrgmHiNJLFX',
  'suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK',
  'B55PH2b2mJjQpQShcwuaNFSp4LcARJqwx14tqtyhVRc3',
  'b1my4AWDY4R6K3mhLkoF1Cxxg1rLaC62iSTJCEexx7k',
  '73LnJ7G9ffBDjEBGgJDdgvLUhD5APLonKrNiHsKDCw5B',
  'E3uqAVUdXDQrgAJobmuDhzwMX2ja8TMV1EEp8ZUSyqNW',
  'VXVTEghia6M74TbwRT4e3XScCoRxr7NybHb85L6gT9P',
  '7ugQtN6GtkKoMHAb3i4rf9uERpVgPyV3Er2wBc8AnSem',
  '9vd4975BwrR3uDVdSZWAAvWzzYx6mFrdnDDuy5PaoF4r',
  'GJgMeortRJNPuHahkMR14vLRLMZJCaJuqoXSAt4ErCRk',
  'X8vpCehdmhqBAN7DJyHiFG7tenTuum7KgUDmq1UrzGM',
  'ApRnQN2HkbCn7W2WWiT2FEKvuKJp9LugRyAE1a9Hdz1',
  '4hvcYyWukNbwAgmaN6WvA3BmRuDkf3vg1njKFC4YmrgM',
  'VqoaBFvNmDKVrhDRs3ziNA7Dv6ySqCGint8wSF2EzFR',
  'F8K6p7gJYDpiw18MajSY5QKoe7u2pYWa1RYbGVsJEJkh',
  '45GeQh3M4V6LrrBJw7Wugk4aKpu18SnTHMBeaVKtLUoh',
  '6X3Amr3bkWz3eNXdToNaYpEFxWworS935Bt62NhEBAv1',
  '23yjybAMBaftwHLzjNHUjAsZrCJ2THAen1sc2pmbR18z',
  'FKfCsWvBgadnfVtg7thQWdLgZkud1jXgex2CQhoGLocW',
  'EWH2o5SKFnLc8HQKdPBi5BvynzsV6SwkV6jHUMXaQdE6',
  '7nmwT4GzkZ184XyZGPUcRXbYrLBtBHGD87kUj3uj5ABD',
  'H8U6FCx5RWHJQKo7Sb1TT8zMqHoiGehmNbUf5dhyQUGc',
  '8rCWn3NoywiM1k9R6xtw7khWu7JX9uPB3Yh22qYnk92i',
  'HbFuufmH9EmnRzwCMaUa4vobCD3N8LpNZL2stxv4yHnM',
  'DYWDr2FDeGcHeZaCPNeqgLR95i8AuMGuqGr3F3Qb5Ae4',
  '4qiY8FuqrjAVw9JKq84xA5G3wGjMGf6MkR1Lzhc9khov',
  '6bu2TpEPtzRPCBp1Nf1yvkHiW8dZpYbsnXREKbTsJN1C',
  'HczgNsNGCreriUr3y4x1GuPNk76PoRWxBVsDSv5mgumm',
  'FUuqa1XZLdMk31xcRSqMYxwMN7hNY2i5XDQXYosimhLd',
  'GEgsqCBvCvW3vbvrZfvGGJh6syLqE4AVVZeQTPkm8Ti9',
  'nya666pQkP3PzWxi7JngU3rRMHuc7zbLK8c8wxQ4qpT',
  'EaeStvjr9AKDXU14aNUMEpLR5FdeZ4QV4JweQyS1t66q',
  'HuAQDzWFxn1BSBJPFLdJ1xkK6UF2keY49RPwQJACCmtK',
  'DHo9YZzTE1RjjwMdsKRHEPhuUdKZ53K4GwJFXw2E3APf',
  '5dFWqsyZHnaYXFcPegCm9GwMGtX384X9bGGEe9opQGCZ',
  '2La56oUHV7wTcHUDH4yFwrmnwdZDH2G43ipumaZUKDQS',
  'BtMBMPkoNbnLF9Xn552guQq528KKXcsNBNNBre3oaQtr',
  '56Xx6FLQ8skDoMHjYJA5oMr1iDWab7hTFup636mhbjBE',
  'A3V6sg2MUVqFpfQzCa13m1GSMYrjcT2YmNt8oq9SeqsZ',
  'suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK',
  '6GV8d2vexSMg76Ap5kJeKw4x8w5QyuifLGrgmHiNJLFX',
  'FBYzQbR1ZZ8uw7kVNDwkiGqnjic94JnABuoG11MU7YPG',
  'A3V6sg2MUVqFpfQzCa13m1GSMYrjcT2YmNt8oq9SeqsZ',
  'DDd9eB81F4vTu7krEP6qY3mJCVh8Puv47TrV8gwq3kfp',
  '58PFuVHHt9qVpKWHM9XgXwRPDqc1Z1pm2AC2REsUhwqB',
  '9EfnZCv5ENXQ5gKkLZHGs8sM4f3P1kYVdqpTBKLZv4uD',
  '5dFWqsyZHnaYXFcPegCm9GwMGtX384X9bGGEe9opQGCZ',
  'GHKw6sGbAJUeCpgLFGNb1wFtzd4KXG9ZwJyei5joDp6M',
  '43ZQHPmsHfwoBLifHqUbCAGQPRPrpJd6L8GrUP6Zy3xL',
  'GNQvKbp3tjRSsGb9kPFuFHXcUFCxP83pkFwiRbj5hWYN',
  'zhYnXqK3MNSmwS3yxSvPmY5kUa1n2WUaCJgYUDrAHkL',
  'DPbY9FB7WconC8bwsAy5BJPVeseDugmtYF4U83Rk67in',
  'EZPzB42TX75qZ8oRmd2dvdxikbphHChxCAxHDX358pdT',
  '7bC4sLND3KyUWvxGxwCdfBmS4uUaVNv5euknEYfbPPiE',
  'ETbWz5Q3ZPwkMBDfHtauq2NyfzbtRxFXa4XaGzSvT4WR',
  'DPbY9FB7WconC8bwsAy5BJPVeseDugmtYF4U83Rk67in',
  '9tbGNjKTcJiYNE8rnCBxnD9kateC7eeposZrzD35d5wt',
  'dVs7zZksjFuq73xbtUC62brFXYYuxCuPSG4wZeGiHck',
  'HpeYGanLi2t4dogfTzCv5EFcHRfmjDzddCYyKC3v3iym',
  '7eUonoTpBUfjVrvWaRNGHCK2Hrnp4T8WyiXPj2GPtStM',
  '67YvDw2zokBrxRFK3d4RffSRwmobShqWsjEMnavGkQy9',
  '89vBp3FpjhDMbh2H4ohbTATWkTgN8HYxwHFPpn8s2RH1',
  '7jUZ8bHwaCf3wuvXZvk5BDQDzKN1HFVWHknD68ZJdsHr',
  'A3V6sg2MUVqFpfQzCa13m1GSMYrjcT2YmNt8oq9SeqsZ',
  'Cvmo9SmWvBabC6ssW5uwThNKWipYJ6UUycBf4dibdQ97',
  'EgF1SoQFYnW6bR4bNCkMx5bkwjvjNDxY3YgwJkoQUz7z',
  '5LHJtKdULxxWvjrRe36f6bjcDx7xikmtnutKuyMebAbo',
  'Gb8hF3dex5XsDYMFThaCUvLQngshMJbKuU4fc9PjiVp1',
  'AQSkyQe2CKfZJXPTHVXjKJKudJ5NUxyWyXLySv6R3nFk',
  'EZPzB42TX75qZ8oRmd2dvdxikbphHChxCAxHDX358pdT',
  '9R2UJG1Wyoo5V376TKkHcp98hrKEQhmGMmx8jVtRLJoz',
  'DtDHVKqTTw7bj4rpDncr6XmSubJv9cR7cKtoGyRVTKUm',
  'EYGTewP6TrVpLn7WwoHYB12wAxYPoyZgvkjjbscyi4YM',
  'GXmJTB1Pnuz9dHWrzrgkBFs6Jx1VmpRJWoX13wkJio95',
  '9FqFzMncAsQVsDJCK7wqEBHuJYRgferMrtBjSSK3SGwq',
  'EXEeLF1YiZxC1tFneoQPv6rcdq5VMUbKNGy3DLPEo2oH',
  'BLM2Est3LmfFb3BMZaw1MQ9jark2N6xPRJ5WycxzyHGS',
  'X8vpCehdmhqBAN7DJyHiFG7tenTuum7KgUDmq1UrzGM',
  '638X1sGh3W83pFBa6Btffyy7gbBHr1JUWFbzdcydvtQp',
  'DhtZrHkw85GCxvkzpSNWTisUf7xZViwdRk1Yoz7APv4R',
  'EXEeLF1YiZxC1tFneoQPv6rcdq5VMUbKNGy3DLPEo2oH',
  'EZPzB42TX75qZ8oRmd2dvdxikbphHChxCAxHDX358pdT',
  'ChrQxKbLdV1Afk5vRWjzYuutCid9PdrnYizwX5oZnxGu',
  'DL3vXJ3d9XGDqbhvNbk8FHKm2Kd2hsPYPkEK96FLEFBU',
  'DtDHVKqTTw7bj4rpDncr6XmSubJv9cR7cKtoGyRVTKUm',
  '7xwwWbyBeA45BfVkc6oSEMxGHa4yRNnbiXCrhvJX16zp',
  'BtMBMPkoNbnLF9Xn552guQq528KKXcsNBNNBre3oaQtr',
  'suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK',
  'BnR2f6oT38HmcKTr89YHK2yFUz4XzSDrYiaqHLShgxAG',
  'EZPzB42TX75qZ8oRmd2dvdxikbphHChxCAxHDX358pdT',
  'DBmettWCbsQML9bwzZ2pAAiFukxCg4QkJrbg1bMDJfft',
  'B5jrCMw2D8JhrXyioiU7Qw5mmUvFqV1PF5NSNCKbNZJC',
  'DhgFeiXfRSpP1k6XsR8cpjhn2RJzV49LxYkZB2S2ddzh',
  'X1C2Qt6NZc7EpnJ3hEXPVkTrxJX1Z47CdWCkxbobogA',
  '3qfDL6vJXkfrEcUJ8jrMZC2rYReUxzYHk4iu3hdCMDUx',
  'BXLj5SQ9fM5csGXicKR2h3hogypMVn26mWgqgbe8D2WY',
  'ChrQxKbLdV1Afk5vRWjzYuutCid9PdrnYizwX5oZnxGu',
  '9R2UJG1Wyoo5V376TKkHcp98hrKEQhmGMmx8jVtRLJoz',
  '6JbzwE29kZz3P9GuswyGYavmBx5LErQe5aHxBhQbN3o',
  'nya666pQkP3PzWxi7JngU3rRMHuc7zbLK8c8wxQ4qpT',
  'EbZmFsWgtJ5XpcKpcDzVLi9r8Z6FTYCndM9wKVTAM7Hc',
  'AT6FsbUy1jNR2AHE35WCVh3nSdDtYADtdhA2KitQXmL5',
  '73LnJ7G9ffBDjEBGgJDdgvLUhD5APLonKrNiHsKDCw5B',
  '7yDNDzYJqKz6unAjBFc2aUJYf4hyJrMc5iKNt2PdGBvq',
  'B55PH2b2mJjQpQShcwuaNFSp4LcARJqwx14tqtyhVRc3',
  '2TFq7wCrXDgpstw5ov67NVisZ2RV4WFmF2DmWL5pTHVh',
  'HjjpwGoq5uaeutqrCZaF6ZLEj8kcJ5qsMxdZyxhreMo1',
  '5h5rUGgN7n5anRpzYGViK5yW45WHFeo8QK43dxKnLdw2',
  'EbZmFsWgtJ5XpcKpcDzVLi9r8Z6FTYCndM9wKVTAM7Hc',
  '4K8ddPWEAeJkspiReWjhzc6eeVLQRZP2bHkpJuUi2LvE',
  'F6ntDyV8WALyL3ehSaFrraxvgRUj7w7b7ipsie3kCGWz',
  'GDkpZYxTbJYdvxnhYGig46T4WrZAp1gTSk7cvZfnXd9u',
  '7sodLerXt18VwRC57DMJkPQYYwNoubR9ATiMftaQm1k7',
  '2L6t61zYN548n59VoHFK221DsQSKGn6JRMhkmwosUcSt',
  '757Cw6zsYkc5mb3CAwoMf4nUNZ3CgCTEN87BvfYxY9Qi',
  '2eHQuhpB5yprGZ1CSFrEUS6oSzHGX1y8vkrpPXGhzA1g',
  '8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR',
  'GbZiBYyDfM4jjBQUNSLSRxbZDr3mBsN9F7fBbyiGWpWo',
  '2L6t61zYN548n59VoHFK221DsQSKGn6JRMhkmwosUcSt',
  'GDkpZYxTbJYdvxnhYGig46T4WrZAp1gTSk7cvZfnXd9u',
  '3CRjuh81Rnhk7WHf878mxQ5GgXvshkkRaPK2gEWhnHW8',
  'dVs7zZksjFuq73xbtUC62brFXYYuxCuPSG4wZeGiHck',
  '6SG6YYMGr9fb9AeMRaM7GZExNo7TqWJYGoNtdkNBPZ98',
  '2L6t61zYN548n59VoHFK221DsQSKGn6JRMhkmwosUcSt',
  '696969Y6orZEjp4gZtwcCZS7TNVuhMVE6G5mFvdJ4mYq',
  '4sW7TzXgZf7KSJU3DXondJbdH2hq4CvV9XFDt5iY25Cz',
  '4b8CmSTb9y8P3vSq8gtn4uLwDZBcua6nuroxKbD3cyZt',
  '3SXty9M8FNLEVBTMpH2B8cv7CZvXVR7kNa8eMGjJdUW5',
  '8jLysUAsJj4AMvNvqDDzU8ijk8BTy9sm8kFRsQH9FDF8',
  'o5qSZU7AT2QVDFBLvnRA71z1n4p6KFTds36wVvQTQ5R',
  '2mHNWkM9eHyhkVgEDvjVmNuSfKY3GGW5Kqe9FPHJTQdB',
  '9Hu5h5eEeGCdLEs1oVCxyuoUfwcgrxnVBkHWxUbURwry',
  'AGqjivJr1dSv73TVUvdtqAwogzmThzvYMVXjGWg2FYLm',
  'tYGCfzdZTXEkG9rvbxUH8f8AgGmPRNDdMPkR1ERcCu8',
  'BtMBMPkoNbnLF9Xn552guQq528KKXcsNBNNBre3oaQtr',
  'EJM2zrEd4uc6662LVVdDN5bH9iDFy2A4mDuhLttMkhby',
  '2L6t61zYN548n59VoHFK221DsQSKGn6JRMhkmwosUcSt',
  'GDkpZYxTbJYdvxnhYGig46T4WrZAp1gTSk7cvZfnXd9u',
  'ERhapVrRLLPEYQnCqCJ8ETTb4Jpa7k52HCZUZyLCYzPr',
  '5Edh8W6e2SKZjx3zMcG7sHsgGbDm6ktkq8qEj3cYDQVn',
  '696969Y6orZEjp4gZtwcCZS7TNVuhMVE6G5mFvdJ4mYq',
  'nya666pQkP3PzWxi7JngU3rRMHuc7zbLK8c8wxQ4qpT',
  'Ewt9iAMbZ5kZTg86g8wxMvZdoi2ZoexM4ymqkMR92bNx',
  'h5ZwzHkNGvNxHc2imwqeSXwpsnw8zFX9FEZWfuLY9Ww',
  '4SiFzRaD11yqLtHSYCnxjRQNnajnRiSktaqe8fhr3uJk',
];
const test = async (
  lastDay = '23.09.2024',
  lastTime = 60 * 60 * 1000,
  isFarm = false,
  mc = 40,
) => {
  const filterTime = Date.now() - lastTime;
  const data = await getCurrentJson();
  const lastData = await getJSON(lastDay);

  // const prosto = lastData.reduce((a, b) => {
  //   if (a[b.mint]) {
  //     a[b.mint] += 1;
  //   } else {
  //     a[b.mint] = 1;
  //   }
  //   return a;
  // }, {});
  // console.log(Object.entries(prosto).filter((value: any) => value[1] > 1));

  const filterData = isFarm
    ? data.filter((item) => item.creation >= filterTime && item.mc >= mc)
    : data.filter((item) => {
        return (
          item.creation >= filterTime && item.isFarm === false && item.mc >= mc
        );
      });

  const currentTraders = Array.from(
    new Set(filterData.flatMap((item) => item.traders)),
  );

  const traders = intersection(currentTraders, staticTraders);

  console.log(
    'All Traders: ',
    currentTraders.length,
    'Top Traders: ',
    traders.length,
    new Date().toLocaleTimeString(),
  );

  const result = lastData.map((item) => {
    return {
      ...item,
      intersection: intersection(item.traders, [
        ...currentTraders,
        ...staticTraders,
      ]).length,
    };
  });

  return result;
};

const getNamesMeta = async (filterTime: number, mc = 30) => {
  const data = await getCurrentJson();
  const time = Date.now() - filterTime;
  const filterData = data.filter((item) => {
    return item.creation >= time && item.mc >= mc;
  });
  const keysName: {
    [name: string]: number;
  } = {};
  const keysSymbol: {
    [name: string]: number;
  } = {};

  const noNeeded = ['the', 'a', 'of', 'on', 'in', 'with', 'wif', 'for'];

  filterData.forEach((item) => {
    const names = (item.name ?? '').toLocaleLowerCase().split(' ') ?? [];
    const symbols = (item.symbol ?? '').toLocaleLowerCase().split(' ') ?? [];

    names.forEach((name) => {
      if (name.trim() === '') {
        return;
      }
      if (noNeeded.includes(name)) {
        return;
      }
      if (keysName[name]) {
        keysName[name] += 1;
      } else {
        keysName[name] = 1;
      }
    });

    symbols.forEach((name) => {
      if (noNeeded.includes(name)) {
        return;
      }
      if (name.trim() === '') {
        return;
      }
      if (keysSymbol[name]) {
        keysSymbol[name] += 1;
      } else {
        keysSymbol[name] = 1;
      }
    });
  });

  return {
    names: Object.entries(keysName)
      .sort((a, b) => +b[1] - +a[1])
      .filter((_, index) => index <= 10),
    symbols: Object.entries(keysSymbol)
      .sort((a, b) => +b[1] - +a[1])
      .filter((_, index) => index <= 10),
  };
};

const monitoringMeta = async (mc: number = 38) => {
  const data1 = await getNamesMeta(60 * 60 * 1000);
  const data11 = await getNamesMeta(60 * 60 * 1000, mc);
  const data2 = await getNamesMeta(3 * 60 * 60 * 1000);
  const data22 = await getNamesMeta(3 * 60 * 60 * 1000, mc);
  const data3 = await getNamesMeta(20 * 60 * 1000);
  const data33 = await getNamesMeta(20 * 60 * 1000, mc);

  console.log('3 Часа Мета');
  console.log('Names: |' + data2.names.join('| |') + '|');
  console.log('Symbols: |' + data2.symbols.join('| |') + '|');
  console.log('Names with MC: |' + data22.names.join('| |') + '|');
  console.log('Symbols with MC: |' + data22.symbols.join('| |') + '|');
  console.log('-----------------------------------\n\n');
  console.log('1 Час Мета');
  console.log('Names: |' + data1.names.join('| |') + '|');
  console.log('Symbols: |' + data1.symbols.join('| |') + '|');
  console.log('Names with MC: |' + data11.names.join('| |') + '|');
  console.log('Symbols with MC: |' + data11.symbols.join('| |') + '|');
  console.log('-----------------------------------\n\n');
  console.log('20хв Мета');
  console.log('Names: |' + data3.names.join('| |') + '|');
  console.log('Symbols: |' + data3.symbols.join('| |') + '|');
  console.log('Names with MC: |' + data33.names.join('| |') + '|');
  console.log('Symbols with MC: |' + data33.symbols.join('| |') + '|');
  console.log('-----------------------------------\n\n');

  return {
    data1,
    data11,
    data2,
    data22,
    data3,
    data33,
  };
};

monitoringMeta();
setInterval(() => {
  test('23.09.2024', 30 * 60 * 1000, false, 36);
  monitoringMeta();
}, 10000);

// const parse = () => {
//   const data = (doc as any[])
//     .filter((item: any) => {
//       return (
//         item.buys >= 7 &&
//         item.mc >= 36 &&
//         item.buys <= 100 &&
//         item.isFarm === false
//       );
//     })
//     .map((item: any) => {
//       return {
//         mc: item.mc,
//         mint: item.mint,
//         url: 'https://pump.fun/' + item.mint,
//       };
//     });

//   fs.promises.writeFile('parse.json', JSON.stringify(data), {});
// };

// parse();
