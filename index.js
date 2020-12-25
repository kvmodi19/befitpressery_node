const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Razorpay = require("razorpay");
const config = require('./config');
const nodemailer = require('nodemailer');

const key_id = config.payment.key_id;
const key_secret = config.payment.secret;
const instance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors('*'));

app.post('/createOrder', (req, res) => {
    try {
        const options = {
            amount: req.body.amount,
            currency: "INR",
            receipt: req.body.receipt
        };
        instance.orders.create(options, (err, order) => {
            console.log('createOrder -> order', order);
            console.log('createOrder -> error', err);
            order ? res.status(200).send(order) : res.status(500).send(err);
        });
    } catch (error) {
        console.log('createOrder -> error', err);
        return res.status(500).send(error);
    }
});

app.post('/capturePayments', (req, res) => {
    try {
        const { payment_id } = req.body;
        instance.payments.fetch(payment_id, (err, order) => {
            console.log('capturePayments -> order', order);
            console.log('capturePayments -> error', err);
            order ? res.status(200).send(order) : res.status(500).send(err);
        });
    } catch (error) {
        console.log('capturePayments -> error', err);
        return res.status(500).send(error);
    }
});

app.post('/sendEmailNotification', (req, res) => {
    try {
        const { to, subject, emailBody } = req.body;
        const mailOptions = {
            from: config.email.user,
            to: to,
            subject: subject,
            html: emailBody
        };
        const transporter = nodemailer.createTransport({
            service: config.email.serviceProvider,
            auth: {
                user: config.email.user,
                pass: config.email.pass
            }
        });
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('sendEmailNotification -> error', error.message);
            }
            res.status(200).send({
                message: "success"
            })
        });
    } catch (error) {
        console.log('createOrder -> error', err);
        return res.status(500).send(error);
    }
});

app.get('*', (req, res) => {
    res.send('working');
});

app.listen(3000, () => {
    console.log('listening on 3000');
});