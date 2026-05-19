import { MapPin, Phone, Stethoscope, AlertTriangle, ClipboardList } from 'lucide-react';

const DoctorLocator = () => {
  const location = 'gynecologist+near+me';
  const mapSrc = `https://maps.google.com/maps?q=${location}&output=embed`;

  const emergencyContacts = [
    { label: 'Ambulance', number: '108', icon: '🚑' },
    { label: 'Women Helpline', number: '1091', icon: '📞' },
  ];

  const warningSign = [
    'Heavy vaginal bleeding',
    'Severe abdominal pain',
    'High fever (over 100.4°F)',
    'Severe headache or vision changes',
    'Sudden swelling of face or hands',
    'Decreased baby movement',
  ];

  const doctorTips = [
    'List of current medications and supplements',
    'Questions about your symptoms',
    'Previous medical records',
    'Insurance information',
    'A support person for company',
  ];

  const visitFrequency = [
    { trimester: '1st Trimester', freq: 'Every 4 weeks' },
    { trimester: '2nd Trimester', freq: 'Every 2-4 weeks' },
    { trimester: '3rd Trimester', freq: 'Every 1-2 weeks' },
  ];

  const whatToLook = [
    { label: 'Board certified OB-GYN', icon: '✅' },
    { label: 'Hospital affiliation', icon: '🏥' },
    { label: 'Experience with your needs', icon: '👩‍⚕️' },
    { label: 'Communication style', icon: '💬' },
  ];

  return (
    <div className="pb-bottom-nav">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl font-bold text-gray-800">Find a Doctor 🏥</h1>
          <p className="text-gray-400 text-sm mt-1">Locate nearby gynecologists</p>
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-rose-50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <iframe
            src={mapSrc}
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Doctor Locator Map"
          />
        </div>

        {/* What to look for */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope size={18} className="text-blue-500" />
            <h3 className="font-semibold text-gray-800 text-sm">What to Look For</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {whatToLook.map(item => (
              <div key={item.label} className="flex items-center gap-2 bg-blue-50 rounded-xl p-3">
                <span>{item.icon}</span>
                <span className="text-xs text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border border-red-100 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Phone size={18} className="text-red-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Emergency Contacts</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {emergencyContacts.map(contact => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="flex items-center gap-3 bg-white rounded-xl p-3 hover:shadow-md transition"
              >
                <span className="text-xl">{contact.icon}</span>
                <div>
                  <p className="text-xs text-gray-500">{contact.label}</p>
                  <p className="font-bold text-red-600">{contact.number}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Warning Signs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-semibold text-gray-800 text-sm">When to Call Your Doctor</h3>
          </div>
          <ul className="space-y-2">
            {warningSign.map(sign => (
              <li key={sign} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                {sign}
              </li>
            ))}
          </ul>
        </div>

        {/* Tips for Visit */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={18} className="text-green-500" />
            <h3 className="font-semibold text-gray-800 text-sm">What to Bring</h3>
          </div>
          <ul className="space-y-2">
            {doctorTips.map(tip => (
              <li key={tip} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Visit Frequency */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100 animate-fade-in" style={{ animationDelay: '0.35s' }}>
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Recommended Visit Frequency</h3>
          <div className="space-y-2">
            {visitFrequency.map(v => (
              <div key={v.trimester} className="flex justify-between items-center bg-white/70 rounded-xl p-3">
                <span className="text-sm text-gray-700 font-medium">{v.trimester}</span>
                <span className="text-sm text-purple-600 font-semibold">{v.freq}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLocator;
