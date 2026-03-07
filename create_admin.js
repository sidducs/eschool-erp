const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./backend/models/User');
const bcrypt = require('bcryptjs');

dotenv.config({ path: './backend/.env' });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const existingAdmin = await User.findOne({ email: 'testadmin@example.com' });
        if (existingAdmin) {
            console.log('Test Admin already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const user = await User.create({
            name: 'Test Admin',
            email: 'testadmin@example.com',
            password: hashedPassword,
            role: 'admin',
            status: 'active'
        });

        console.log('Test Admin Created:', user.email);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
