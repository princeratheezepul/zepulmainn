import 'dotenv/config';
import mongoose from 'mongoose';
await mongoose.connect(process.env.DB_URL);
const u = await mongoose.connection.db.collection('users').findOne({email:'licensepartner@gmail.com'},{projection:{name:1,email:1,role:1,isLicensePartner:1,isEmployerManager:1,companyId:1,company:1,jobs:1}});
console.log(JSON.stringify(u,null,1));
if (u?.companyId) console.log(await mongoose.connection.db.collection('companies').findOne({_id:u.companyId},{projection:{name:1}}));
await mongoose.disconnect();
