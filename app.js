const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const createError = require('http-errors')
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
//const FileStore = require('session-file-store')(session); //함수이므로 인자를 전달해줘야함
//const redis = require('redis');
//const ConnectRedis = require('connect-redis')(session); //FileStore랑 같은 기능
const MySQLConnect = require('express-mysql-session')(session);
const indexRouter = require('./routes/index');
const boardRouter = require('./routes/board'); //router 불러옴 (js끼리는 .js생략가능)
const userRouter = require('./routes/user');


/* ----------------------------------------- Global Variables */



/* ----------------------------------------- Server Running */
app.listen(process.env.port, () => {
	console.log(`http://127.0.0.1:${process.env.port}`);
});




// ----------------------------------------- View engine */
app.locals.pretty = true; 
app.locals.title = "Node.js 리뷰"; 
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));





/* ----------------------------------------- Middleware */
app.use(express.json());
app.use(express.urlencoded({extended: false}));
//json으로 가져온 후 쿠키처리 해야하므로 여기에 있어야 함
app.use(cookieParser(process.env.cookieSalt)); //암호화해서 쿠키파서하겠습니다

app.use( session({
	secret: process.env.cookieSalt,
	resave: false,
	saveUninitialized: false,
	cookie: {secure: false},
	//store: new FileStore() 
	/*
		store: new ConnectRedis({ //redis option
		"host": "localhost", 
		"port": 6379, 
		"prefix": "session", //저장할 값 앞에 단어를 붙혀주는 기능
		"client": redis.createClient(6379, "localhost"), 
		"db": 0 */
		store: new MySQLConnect({
			host: 'localhost',
			port: 3306,
			user: 'root',
			password: process.env.dbpass,
			database: 'node'
		})
}));
	// 암호화해서 세션을 사용하겠습니다 (객체로 전달)

/* ----------------------------------------- Router */
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', indexRouter);
app.use('/board', boardRouter);
app.use('/user', userRouter);


/* ----------------------------------------- Error */
app.use((req, res, next) => {
	res.render('404.pug');
});

app.use((err, req, res, next) => {
	res.send(err.message);
});








