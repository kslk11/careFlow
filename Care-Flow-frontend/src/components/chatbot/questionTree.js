// Question Tree Structure for CareFlow Chatbot
// This defines all possible questions and their relationships

export const questionTree = {
  // ==================== MAIN MENU ====================
  main: {
    id: "main",
    type: "menu",
    message: "Hi {userName}! 👋 How can I help you today?",
    options: [
      {
        id: "opt_appointments",
        text: "📅 Check My Appointments",
        emoji: "📅",
        nextId: "appointments_menu",
        action: "fetchAppointments"
      },
      {
        id: "opt_bills",
        text: "💰 View My Bills",
        emoji: "💰",
        nextId: "bills_menu",
        action: "fetchBills"
      },
      {
        id: "opt_hospitals",
        text: "🏥 Hospital Information",
        emoji: "🏥",
        nextId: "hospitals_menu",
        action: "fetchHospitals"
      },
      {
        id: "opt_doctors",
        text: "👨‍⚕️ My Doctors",
        emoji: "👨‍⚕️",
        nextId: "doctors_menu",
        action: "fetchDoctors"
      }
    ]
  },

  // ==================== APPOINTMENTS MENU ====================
  appointments_menu: {
    id: "appointments_menu",
    type: "menu",
    message: "📅 Here's what I can help you with regarding appointments:",
    dynamicMessage: (data) => {
      if (!data.appointments || data.appointments.length === 0) {
        return "You don't have any appointments yet. Would you like to book one?";
      }
      const pending = data.appointments.filter(a => a.status === 'pending').length;
      const approved = data.appointments.filter(a => a.status === 'approved').length;
      return `You have ${data.appointments.length} appointment(s): ${pending} pending, ${approved} approved.`;
    },
    options: [
      {
        id: "opt_next_appointment",
        text: "📆 Next Appointment Date",
        emoji: "📆",
        nextId: "next_appointment",
        action: "getNextAppointment",
        condition: (data) => data.appointments && data.appointments.length > 0
      },
      {
        id: "opt_all_appointments",
        text: "📋 Show All Appointments",
        emoji: "📋",
        nextId: "all_appointments",
        action: "getAllAppointments",
        condition: (data) => data.appointments && data.appointments.length > 0
      },
      {
        id: "opt_appointment_status",
        text: "✅ Check Appointment Status",
        emoji: "✅",
        nextId: "appointment_status",
        action: "getAppointmentStatus",
        condition: (data) => data.appointments && data.appointments.length > 0
      },
      {
        id: "opt_book_appointment",
        text: "➕ Book New Appointment",
        emoji: "➕",
        nextId: "book_appointment",
        action: "bookAppointment"
      }
    ],
    backTo: "main"
  },

  next_appointment: {
    id: "next_appointment",
    type: "info",
    dynamicMessage: (data) => {
      const upcoming = data.appointments
        ?.filter(a => a.status === 'approved' || a.status === 'pending')
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      
      if (!upcoming) {
        return "You don't have any upcoming appointments.";
      }

      const date = new Date(upcoming.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      return `Your next appointment is on ${date} at ${upcoming.time} with Dr. ${upcoming.doctorId?.name} (${upcoming.doctorId?.specialization}).`;
    },
    options: [
      {
        id: "opt_appointment_details",
        text: "📄 View Full Details",
        emoji: "📄",
        nextId: "appointment_details",
        action: "viewAppointmentDetails"
      },
      {
        id: "opt_cancel_appointment",
        text: "❌ Cancel Appointment",
        emoji: "❌",
        nextId: "cancel_appointment",
        action: "cancelAppointment",
        condition: (data) => data.nextAppointment?.status === 'pending'
      },
      {
        id: "opt_reschedule",
        text: "🔄 Reschedule",
        emoji: "🔄",
        nextId: "reschedule_appointment",
        action: "rescheduleAppointment"
      },
      {
        id: "opt_back_appointments",
        text: "⬅️ Back to Appointments",
        emoji: "⬅️",
        nextId: "appointments_menu"
      }
    ],
    backTo: "appointments_menu"
  },

  all_appointments: {
    id: "all_appointments",
    type: "list",
    dynamicMessage: (data) => {
      if (!data.appointments || data.appointments.length === 0) {
        return "You don't have any appointments.";
      }
      
      let message = `You have ${data.appointments.length} appointment(s):\n\n`;
      data.appointments.slice(0, 5).forEach((apt, idx) => {
        const date = new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const status = apt.status.charAt(0).toUpperCase() + apt.status.slice(1);
        message += `${idx + 1}. ${date} - Dr. ${apt.doctorId?.name} - ${status}\n`;
      });
      
      if (data.appointments.length > 5) {
        message += `\n... and ${data.appointments.length - 5} more`;
      }
      
      return message;
    },
    options: [
      {
        id: "opt_view_page",
        text: "📱 Open Appointments Page",
        emoji: "📱",
        action: "navigateToAppointments"
      },
      {
        id: "opt_filter_pending",
        text: "⏳ Show Only Pending",
        emoji: "⏳",
        nextId: "pending_appointments",
        action: "filterPendingAppointments"
      },
      {
        id: "opt_filter_approved",
        text: "✅ Show Only Approved",
        emoji: "✅",
        nextId: "approved_appointments",
        action: "filterApprovedAppointments"
      },
      {
        id: "opt_back_appointments",
        text: "⬅️ Back to Appointments",
        emoji: "⬅️",
        nextId: "appointments_menu"
      }
    ],
    backTo: "appointments_menu"
  },

  appointment_status: {
    id: "appointment_status",
    type: "info",
    dynamicMessage: (data) => {
      if (!data.appointments || data.appointments.length === 0) {
        return "You don't have any appointments.";
      }
      
      const statusCount = {
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
        cancelled: 0
      };
      
      data.appointments.forEach(apt => {
        statusCount[apt.status] = (statusCount[apt.status] || 0) + 1;
      });
      
      return `Appointment Status Summary:\n\n` +
             `✅ Approved: ${statusCount.approved}\n` +
             `⏳ Pending: ${statusCount.pending}\n` +
             `✔️ Completed: ${statusCount.completed}\n` +
             `❌ Rejected: ${statusCount.rejected}\n` +
             `🚫 Cancelled: ${statusCount.cancelled}`;
    },
    options: [
      {
        id: "opt_show_pending",
        text: "⏳ Show Pending Appointments",
        emoji: "⏳",
        nextId: "pending_appointments"
      },
      {
        id: "opt_show_completed",
        text: "✔️ Show Completed",
        emoji: "✔️",
        nextId: "completed_appointments"
      },
      {
        id: "opt_book_new",
        text: "➕ Book New Appointment",
        emoji: "➕",
        action: "bookAppointment"
      },
      {
        id: "opt_back_appointments",
        text: "⬅️ Back",
        emoji: "⬅️",
        nextId: "appointments_menu"
      }
    ],
    backTo: "appointments_menu"
  },

  // ==================== BILLS MENU ====================
  bills_menu: {
    id: "bills_menu",
    type: "menu",
    message: "💰 Here's what I can help you with regarding bills:",
    dynamicMessage: (data) => {
      if (!data.bills || data.bills.length === 0) {
        return "You don't have any bills yet.";
      }
      
      const totalBills = data.bills.length;
      const pending = data.bills.filter(b => b.paymentStatus === 'pending').length;
      const paid = data.bills.filter(b => b.paymentStatus === 'paid').length;
      const partial = data.bills.filter(b => b.paymentStatus === 'partial').length;
      
      const totalAmount = data.bills.reduce((sum, b) => sum + b.totalAmount, 0);
      const totalPaid = data.bills.reduce((sum, b) => sum + b.amountPaid, 0);
      const totalDue = totalAmount - totalPaid;
      
      return `You have ${totalBills} bill(s):\n` +
             `✅ Paid: ${paid}\n` +
             `⏳ Pending: ${pending}\n` +
             `📊 Partial: ${partial}\n\n` +
             `Total Due: ₹${totalDue.toLocaleString()}`;
    },
    options: [
      {
        id: "opt_total_bill",
        text: "💵 Total Bill Amount",
        emoji: "💵",
        nextId: "total_bill",
        action: "getTotalBill"
      },
      {
        id: "opt_pending_bills",
        text: "⏳ Pending Bills",
        emoji: "⏳",
        nextId: "pending_bills",
        action: "getPendingBills"
      },
      {
        id: "opt_payment_history",
        text: "📜 Payment History",
        emoji: "📜",
        nextId: "payment_history",
        action: "getPaymentHistory"
      },
      {
        id: "opt_pay_bill",
        text: "💳 Pay Bill Now",
        emoji: "💳",
        action: "payBill"
      }
    ],
    backTo: "main"
  },

  total_bill: {
    id: "total_bill",
    type: "info",
    dynamicMessage: (data) => {
      if (!data.bills || data.bills.length === 0) {
        return "You don't have any bills.";
      }
      
      const totalAmount = data.bills.reduce((sum, b) => sum + b.totalAmount, 0);
      const totalPaid = data.bills.reduce((sum, b) => sum + b.amountPaid, 0);
      const totalDue = totalAmount - totalPaid;
      
      return `Your Bill Summary:\n\n` +
             `Total Amount: ₹${totalAmount.toLocaleString()}\n` +
             `Amount Paid: ₹${totalPaid.toLocaleString()}\n` +
             `Amount Due: ₹${totalDue.toLocaleString()}\n\n` +
             `Total Bills: ${data.bills.length}`;
    },
    options: [
      {
        id: "opt_view_all_bills",
        text: "📋 View All Bills",
        emoji: "📋",
        action: "navigateToBills"
      },
      {
        id: "opt_pending_only",
        text: "⏳ Show Pending Only",
        emoji: "⏳",
        nextId: "pending_bills"
      },
      {
        id: "opt_pay_now",
        text: "💳 Pay Now",
        emoji: "💳",
        action: "payBill"
      },
      {
        id: "opt_back_bills",
        text: "⬅️ Back",
        emoji: "⬅️",
        nextId: "bills_menu"
      }
    ],
    backTo: "bills_menu"
  },

  pending_bills: {
    id: "pending_bills",
    type: "list",
    dynamicMessage: (data) => {
      const pendingBills = data.bills?.filter(b => 
        b.paymentStatus === 'pending' || b.paymentStatus === 'partial'
      );
      
      if (!pendingBills || pendingBills.length === 0) {
        return "Great! You don't have any pending bills. 🎉";
      }
      
      let message = `You have ${pendingBills.length} pending bill(s):\n\n`;
      pendingBills.slice(0, 4).forEach((bill, idx) => {
        const dueAmount = bill.totalAmount - bill.amountPaid;
        message += `${idx + 1}. Bill #${bill.billNumber}\n`;
        message += `   Hospital: ${bill.hospitalId?.name}\n`;
        message += `   Due: ₹${dueAmount.toLocaleString()}\n\n`;
      });
      
      return message;
    },
    options: [
      {
        id: "opt_pay_highest",
        text: "💳 Pay Highest Bill",
        emoji: "💳",
        action: "payHighestBill"
      },
      {
        id: "opt_view_details",
        text: "📄 View Bill Details",
        emoji: "📄",
        action: "navigateToBills"
      },
      {
        id: "opt_payment_plan",
        text: "📊 Payment Plans (EMI)",
        emoji: "📊",
        nextId: "payment_plans"
      },
      {
        id: "opt_back_bills",
        text: "⬅️ Back",
        emoji: "⬅️",
        nextId: "bills_menu"
      }
    ],
    backTo: "bills_menu"
  },

  payment_history: {
    id: "payment_history",
    type: "info",
    dynamicMessage: (data) => {
      const paidBills = data.bills?.filter(b => b.paymentStatus === 'paid' || b.amountPaid > 0);
      
      if (!paidBills || paidBills.length === 0) {
        return "You haven't made any payments yet.";
      }
      
      const totalPaid = paidBills.reduce((sum, b) => sum + b.amountPaid, 0);
      
      let message = `Payment History:\n\n`;
      message += `Total Paid: ₹${totalPaid.toLocaleString()}\n`;
      message += `Transactions: ${paidBills.length}\n\n`;
      
      message += `Recent Payments:\n`;
      paidBills.slice(0, 3).forEach((bill, idx) => {
        message += `${idx + 1}. ₹${bill.amountPaid.toLocaleString()} - ${bill.hospitalId?.name}\n`;
      });
      
      return message;
    },
    options: [
      {
        id: "opt_download_receipt",
        text: "📥 Download Receipts",
        emoji: "📥",
        action: "downloadReceipts"
      },
      {
        id: "opt_view_bills_page",
        text: "📱 Open Bills Page",
        emoji: "📱",
        action: "navigateToBills"
      },
      {
        id: "opt_pending_bills_check",
        text: "⏳ Check Pending Bills",
        emoji: "⏳",
        nextId: "pending_bills"
      },
      {
        id: "opt_back_bills",
        text: "⬅️ Back",
        emoji: "⬅️",
        nextId: "bills_menu"
      }
    ],
    backTo: "bills_menu"
  },

  // ==================== HOSPITALS MENU ====================
  hospitals_menu: {
    id: "hospitals_menu",
    type: "menu",
    message: "🏥 What would you like to know about hospitals?",
    dynamicMessage: (data) => {
      if (!data.hospitals || data.hospitals.length === 0) {
        return "No hospital information available.";
      }
      return `We have ${data.hospitals.length} hospital(s) in our network.`;
    },
    options: [
      {
        id: "opt_visited_hospitals",
        text: "🏥 Hospitals I've Visited",
        emoji: "🏥",
        nextId: "visited_hospitals",
        action: "getVisitedHospitals"
      },
      {
        id: "opt_hospital_contact",
        text: "📞 Hospital Contact Info",
        emoji: "📞",
        nextId: "hospital_contact",
        action: "getHospitalContact"
      },
      {
        id: "opt_browse_hospitals",
        text: "🔍 Browse All Hospitals",
        emoji: "🔍",
        action: "navigateToHospitals"
      },
      {
        id: "opt_nearest_hospital",
        text: "📍 Find Nearest Hospital",
        emoji: "📍",
        nextId: "nearest_hospital",
        action: "findNearestHospital"
      }
    ],
    backTo: "main"
  },

  visited_hospitals: {
    id: "visited_hospitals",
    type: "list",
    dynamicMessage: (data) => {
      const visitedHospitals = [...new Set(
        data.appointments?.map(a => a.hospitalId?.name).filter(Boolean)
      )];
      
      if (visitedHospitals.length === 0) {
        return "You haven't visited any hospitals yet.";
      }
      
      let message = `You've visited ${visitedHospitals.length} hospital(s):\n\n`;
      visitedHospitals.forEach((name, idx) => {
        message += `${idx + 1}. ${name}\n`;
      });
      
      return message;
    },
    options: [
      {
        id: "opt_hospital_details",
        text: "📄 View Hospital Details",
        emoji: "📄",
        action: "navigateToHospitals"
      },
      {
        id: "opt_book_at_hospital",
        text: "📅 Book at These Hospitals",
        emoji: "📅",
        action: "navigateToHospitals"
      },
      {
        id: "opt_hospital_reviews",
        text: "⭐ View Hospital Reviews",
        emoji: "⭐",
        nextId: "hospital_reviews"
      },
      {
        id: "opt_back_hospitals",
        text: "⬅️ Back",
        emoji: "⬅️",
        nextId: "hospitals_menu"
      }
    ],
    backTo: "hospitals_menu"
  },

  // ==================== DOCTORS MENU ====================
  doctors_menu: {
    id: "doctors_menu",
    type: "menu",
    message: "👨‍⚕️ What would you like to know about doctors?",
    dynamicMessage: (data) => {
      const myDoctors = [...new Set(
        data.appointments?.map(a => a.doctorId?._id).filter(Boolean)
      )];
      
      if (myDoctors.length === 0) {
        return "You haven't consulted with any doctors yet.";
      }
      
      return `You've consulted with ${myDoctors.length} doctor(s).`;
    },
    options: [
      {
        id: "opt_my_doctors",
        text: "👨‍⚕️ Doctors I've Visited",
        emoji: "👨‍⚕️",
        nextId: "my_doctors",
        action: "getMyDoctors"
      },
      {
        id: "opt_doctor_specialization",
        text: "🎯 Find by Specialization",
        emoji: "🎯",
        nextId: "doctor_specialization",
        action: "findBySpecialization"
      },
      {
        id: "opt_doctor_ratings",
        text: "⭐ Top Rated Doctors",
        emoji: "⭐",
        nextId: "top_doctors",
        action: "getTopDoctors"
      },
      {
        id: "opt_browse_doctors",
        text: "🔍 Browse All Doctors",
        emoji: "🔍",
        action: "navigateToHospitals"
      }
    ],
    backTo: "main"
  },

  my_doctors: {
    id: "my_doctors",
    type: "list",
    dynamicMessage: (data) => {
      const uniqueDoctors = data.appointments?.reduce((acc, apt) => {
        if (apt.doctorId && !acc.find(d => d._id === apt.doctorId._id)) {
          acc.push(apt.doctorId);
        }
        return acc;
      }, []);
      
      if (!uniqueDoctors || uniqueDoctors.length === 0) {
        return "You haven't consulted with any doctors yet.";
      }
      
      let message = `Your Doctors (${uniqueDoctors.length}):\n\n`;
      uniqueDoctors.slice(0, 4).forEach((doc, idx) => {
        message += `${idx + 1}. Dr. ${doc.name}\n`;
        message += `   ${doc.specialization}\n`;
        if (doc.ratings?.average) {
          message += `   ⭐ ${doc.ratings.average}/5 (${doc.ratings.count} reviews)\n`;
        }
        message += `\n`;
      });
      
      return message;
    },
    options: [
      {
        id: "opt_book_with_doctor",
        text: "📅 Book with Doctor",
        emoji: "📅",
        action: "navigateToHospitals"
      },
      {
        id: "opt_rate_doctor",
        text: "⭐ Rate Doctor",
        emoji: "⭐",
        action: "navigateToReviews"
      },
      {
        id: "opt_doctor_details",
        text: "📄 View Doctor Details",
        emoji: "📄",
        action: "navigateToHospitals"
      },
      {
        id: "opt_back_doctors",
        text: "⬅️ Back",
        emoji: "⬅️",
        nextId: "doctors_menu"
      }
    ],
    backTo: "doctors_menu"
  }
};

// Helper function to get question by ID
export const getQuestion = (questionId) => {
  return questionTree[questionId] || questionTree.main;
};

// Helper function to get filtered options based on conditions
export const getFilteredOptions = (question, data) => {
  if (!question.options) return [];
  
  return question.options.filter(option => {
    if (option.condition) {
      return option.condition(data);
    }
    return true;
  });
};