const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const cors = require('cors');
const { initializeCronJobs } = require('./cron/cronJobs');
const adminRoutes = require('./routers/adminRoutes');
const departmentRoutes = require('./routers/departmentRoutes');
const hospitalRoutes = require('./routers/hospitalRoutes');
const doctorRoutes = require('./routers/doctorRoutes');
const userRoutes = require('./routers/userRoutes');
const CombineLoginRoute = require('./routers/CombineLoginRoute')
const appp = require('./routers/appointmentRoutes')
const prescription = require('./routers/PrescriptionRoutes')
const operation = require('./routers/operationRoutes')
const refer =require('./routers/referRoutes')
const bads =require('./routers/bedRoutes')
const billRoutes = require('./routers/Billroutes');
const reviewRoutes = require('./routers/reviewRoutes');
const paymentRoutes = require('./routers/paymentRoutes');
const appointmentPaymentRoutes = require('./routers/appointmentPaymentRoutes');


dotenv.config();
mongoose.connect(process.env.MONGO_URI)
.then(()=>{console.log("Db Connected")
  initializeCronJobs();
})
.catch(()=>console.log("Db not Connected"))

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', adminRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/user', userRoutes);
app.use('/api', CombineLoginRoute);
app.use('/api/appointment', appp);                                      
app.use('/api/prescription', prescription);
app.use('/api/operation', operation);
app.use('/api/refer',refer )
app.use('/api/bed', bads);
app.use('/api/bill', billRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/appointment-payment', appointmentPaymentRoutes);


app.get('/', (req, res) => {
  res.send('Hospital Management System API is running');
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});