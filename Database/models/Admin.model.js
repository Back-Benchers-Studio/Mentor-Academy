import mongoose from "mongoose";
import bcrypt from "bcrypt"
const adminSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'admin name is required'],
        minLength: [1, 'too short admin name']
    },
    phone: {
        type: String,
       // required: [true, 'phone number is required'],

    },
    balance:{
        type: Number,
        default: 0

    },
    email: {
        type: String,
        trim: true,
        required: [true, 'email is required'],
        minLength: 1,
        unique: [true, 'email must be unique']
    },
    password: {
        type: String,
        required: true,
        minLength: [6, 'minLength 6 characters'],
    },
    passwordChangedAt: Date,
    passwordResetToken: {
        type:String,
        default: null
    },
    passwordResetExpires:{
        type: Date,
        default: null
    },

    loggedOutAt: Date,
    role: {
        type: String,
        // enum: ['admin'],
       // required: [true, 'role is required'],
        default: 'admin'
    },


    isActive: {
        type: Boolean,
        default: true
    },

 
}, { timestamps: true })

adminSchema.pre('save', function () {
    console.log(this);
    this.password = bcrypt.hashSync(this.password, 7)
})

adminSchema.pre('findOneAndUpdate', function () {

    if (this._update.password) this._update.password = bcrypt.hashSync(this._update.password, 7)
})

export const adminModel = mongoose.model('admin', adminSchema)



