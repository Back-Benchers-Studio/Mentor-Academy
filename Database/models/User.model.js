import mongoose from "mongoose";
import bcrypt from "bcrypt"
const userSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'user name is required'],
        minLength: [1, 'too short user name']
    },
    educator: {
        type: mongoose.Schema.Types.String,
        ref: 'educator',
        required: true
        // required: function () {
        //     return this.role === 'user';
        //   }
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
      },
      paymentSessionId: {
        type: String,
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
       // enum: ['user','admin'],
       // required: [true, 'role is required'],
        default: 'user'
    },
    verified: { type: Boolean, default: false},

    isBlocked: { type: Boolean, default: false },
    isActive: {
        type: Boolean,
        default: true
    },

}, { timestamps: true })

userSchema.pre('save', function () {
    console.log(this);
    this.password = bcrypt.hashSync(this.password, 7)
})

userSchema.pre('findOneAndUpdate', function () {

    if (this._update.password) this._update.password = bcrypt.hashSync(this._update.password, 7)
})

export const userModel = mongoose.model('user', userSchema)



