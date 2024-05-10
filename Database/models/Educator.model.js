import mongoose from "mongoose";
import bcrypt from "bcrypt"
const educatorSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'educator name is required'],
        minLength: [1, 'too short educator name']
    },
    educator_id: {
        type: String,
        required: true,
        unique: true
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'wallet'
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
       // enum: ['educator'],
       // required: [true, 'role is required'],
        default: 'educator'
    },

    isBlocked: { type: Boolean, default: false },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeesAccepted: {
        type: Boolean,
        default: false
    },

 
}, { timestamps: true })

educatorSchema.pre('save', function () {
    console.log(this);
    this.password = bcrypt.hashSync(this.password, 7)
})

educatorSchema.pre('findOneAndUpdate', function () {

    if (this._update.password) this._update.password = bcrypt.hashSync(this._update.password, 7)
})

export const educatorModel = mongoose.model('educator', educatorSchema)



