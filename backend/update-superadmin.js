import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const updateSuperadmin = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Connected!');

        // Update superadmin with phone and UPI
        const result = await User.findOneAndUpdate(
            { email: 'mr.mohit1540@gmail.com' },
            {
                $set: {
                    phone: '8619053741',
                    'paymentDetails.upiId': 'mohit1540@paytm',
                    'paymentDetails.mobileNumber': '8619053741',
                    'paymentDetails.name': 'Mohit Yadav'
                }
            },
            { new: true }
        );

        if (!result) {
            console.log('❌ Superadmin NOT found!');
        } else {
            console.log('\n✅ Superadmin updated successfully!');
            console.log(`   Email: ${result.email}`);
            console.log(`   Phone: ${result.phone}`);
            console.log(`   UPI ID: ${result.paymentDetails.upiId}`);
            console.log('\n📝 Login Credentials:');
            console.log(`   Email: mr.mohit1540@gmail.com`);
            console.log(`   Password: B93456a@5`);
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

updateSuperadmin();
