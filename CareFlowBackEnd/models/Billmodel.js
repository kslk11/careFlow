// Bill.js - Bill Model for Hospital Income Tracking

const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    // Hospital Information
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true,
        index: true
    },

    // Patient Information
    patientName: {
        type: String,
        required: true,
        trim: true
    },

    patientPhone: {
        type: String,
        required: true,
        trim: true
    },

    patientEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: null
    },

    patientAddress: {
        type: String,
        trim: true,
        default: ''
    },

    // Bill Details
    billNumber: {
        type: String,
        unique: true,
        required: true
    },

    // Related Records
    referralId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Refer',
        default: null
    },

    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        default: null
    },

    prescriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription',
        default: null
    },

    assignedDoctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        default: null
    },

    // Bill Items
    items: [{
        itemType: {
            type: String,
            enum: ['Operation', 'Consultation', 'Medicine', 'Bed', 'Test', 'Other'],
            required: true
        },
        itemName: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        quantity: {
            type: Number,
            default: 1,
            min: 0
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        }
    }],

    // Pricing Breakdown
    subtotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },

    tax: {
        type: Number,
        default: 0,
        min: 0
    },

    discount: {
        type: Number,
        default: 0,
        min: 0
    },

    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },

    // Revenue Split (90% Hospital, 10% Admin)
    // hospitalShare: {
    //     type: Number,
    //     required: true,
    //     min: 0
    // },

    // adminShare: {
    //     type: Number,
    //     required: true,
    //     min: 0
    // },

    // Payment Information
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'cancelled', 'refunded'],
        default: 'pending',
        index: true
    },

    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'netbanking', 'insurance', 'other'],
        default: null
    },

    amountPaid: {
        type: Number,
        default: 0,
        min: 0
    },

    amountDue: {
        type: Number,
        default: 0,
        min: 0
    },

    paymentDate: {
        type: Date,
        default: null
    },

    transactionId: {
        type: String,
        trim: true,
        default: null
    },

    // Additional Information
    notes: {
        type: String,
        trim: true,
        default: ''
    },

    // Bed Assignment Details (if applicable)
    bedDetails: {
        bedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bed',
            default: null
        },
        bedType: String,
        roomNumber: String,
        bedNumber: String,
        admissionDate: Date,
        dischargeDate: Date,
        daysStayed: {
            type: Number,
            default: 0
        },
        bedCharges: {
            type: Number,
            default: 0
        }
    },

    // Operation Details (if applicable)
    operationDetails: {
        operationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Operation',
            default: null
        },
        operationName: String,
        operationDate: Date,
        operationCharges: {
            type: Number,
            default: 0
        }
    },
paymentHistory: [{
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'netbanking', 'wallet', 'razorpay', 'other'],
        default: 'razorpay'
    },
    transactionId: {
        type: String,
        default: null
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentType: {
        type: String,
        enum: ['full', 'partial'],
        default: 'full'
    },
    emiOption: {
        type: Number,
        enum: [null, 2, 3],
        default: null
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'success'
    },
    // Razorpay specific fields
    razorpayOrderId: {
        type: String,
        default: null
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    },
    // Additional notes
    notes: {
        type: String,
        default: ''
    }
}],
    // Timestamps
    billDate: {
        type: Date,
        default: Date.now
    },

    dueDate: {
        type: Date,
        default: function() {
            // Default due date is 7 days from bill date
            const date = new Date();
            date.setDate(date.getDate() + 7);
            return date;
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
billSchema.index({ hospitalId: 1, paymentStatus: 1 });
billSchema.index({ billNumber: 1 });
billSchema.index({ patientPhone: 1 });
billSchema.index({ createdAt: -1 });
billSchema.index({ billDate: -1 });

// Virtual for checking if bill is overdue
billSchema.virtual('isOverdue').get(function() {
    if (this.paymentStatus === 'paid') return false;
    return new Date() > this.dueDate;
});

// Pre-save hook to calculate shares (90% Hospital, 10% Admin)
billSchema.pre('save', async function() {
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    }

    this.totalAmount = this.subtotal + this.tax - this.discount;
    this.hospitalShare = this.totalAmount * 0.9;
    this.adminShare = this.totalAmount * 0.1;
    this.amountDue = this.totalAmount - (this.amountPaid || 0);

    if ((this.amountPaid || 0) >= this.totalAmount) {
        this.paymentStatus = 'paid';
        this.amountDue = 0;
    } else if ((this.amountPaid || 0) > 0) {
        this.paymentStatus = 'partial';
    }
});


// Static method to generate unique bill number
billSchema.statics.generateBillNumber = async function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Format: BILL-YYYY-MM-XXXX
    const prefix = `BILL-${year}-${month}`;
    
    // Find the last bill of this month
    const lastBill = await this.findOne({
        billNumber: new RegExp(`^${prefix}`)
    }).sort({ billNumber: -1 });

    let sequence = 1;
    if (lastBill) {
        const lastSequence = parseInt(lastBill.billNumber.split('-').pop());
        sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

// Instance method to record payment
billSchema.methods.recordPayment = function(amount, method, transactionId = null) {
    this.amountPaid += amount;
    this.paymentMethod = method;
    this.transactionId = transactionId;
    
    if (this.amountPaid >= this.totalAmount) {
        this.paymentStatus = 'paid';
        this.paymentDate = new Date();
        this.amountDue = 0;
    } else {
        this.paymentStatus = 'partial';
        this.amountDue = this.totalAmount - this.amountPaid;
    }
    
    return this.save();
};

// Instance method to calculate bed charges
billSchema.methods.calculateBedCharges = function(pricePerDay, days) {
    const bedCharges = pricePerDay * days;
    
    if (this.bedDetails) {
        this.bedDetails.daysStayed = days;
        this.bedDetails.bedCharges = bedCharges;
    }
    
    // Add to items
    this.items.push({
        itemType: 'Bed',
        itemName: `${this.bedDetails?.bedType || 'Bed'} - Room ${this.bedDetails?.roomNumber || 'N/A'}`,
        description: `${days} day(s) stay`,
        quantity: days,
        unitPrice: pricePerDay,
        totalPrice: bedCharges
    });
    
    return this;
};
billSchema.methods.addPaymentToHistory = function(paymentData) {
    this.paymentHistory.push({
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod || 'razorpay',
        transactionId: paymentData.transactionId,
        paymentDate: paymentData.paymentDate || new Date(),
        paymentType: paymentData.paymentType || 'full',
        emiOption: paymentData.emiOption || null,
        status: paymentData.status || 'success',
        razorpayOrderId: paymentData.razorpayOrderId || null,
        razorpayPaymentId: paymentData.razorpayPaymentId || null,
        razorpaySignature: paymentData.razorpaySignature || null,
        notes: paymentData.notes || ''
    });

    // Update total amount paid
    this.amountPaid += paymentData.amount;
    
    // Update payment status
    const remainingAmount = this.totalAmount - this.amountPaid;
    if (remainingAmount <= 0) {
        this.paymentStatus = 'paid';
        this.paymentDate = new Date();
        this.amountDue = 0;
    } else if (this.amountPaid > 0) {
        this.paymentStatus = 'partial';
        this.amountDue = remainingAmount;
    }

    return this;
};

// Instance method to get total paid amount from history
billSchema.methods.getTotalPaidFromHistory = function() {
    return this.paymentHistory
        .filter(payment => payment.status === 'success')
        .reduce((total, payment) => total + payment.amount, 0);
};

// Instance method to get latest payment
billSchema.methods.getLatestPayment = function() {
    if (this.paymentHistory.length === 0) return null;
    return this.paymentHistory[this.paymentHistory.length - 1];
};
const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;