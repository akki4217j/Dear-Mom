import { useState, useEffect } from 'react';
import { Camera, Trash2, Plus, X } from 'lucide-react';
import { formatDate } from '../utils/pregnancyUtils';
import { memoryAPI } from '../api/api';

const milestones = [
  { tag: 'First Ultrasound', emoji: '👶', color: 'bg-blue-100 text-blue-700' },
  { tag: 'First Kick', emoji: '🦵', color: 'bg-green-100 text-green-700' },
  { tag: 'Baby Shower', emoji: '🎉', color: 'bg-purple-100 text-purple-700' },
  { tag: 'Doctor Visit', emoji: '🏥', color: 'bg-amber-100 text-amber-700' },
  { tag: 'Special Moment', emoji: '💕', color: 'bg-pink-100 text-pink-700' },
  { tag: 'Other', emoji: '📌', color: 'bg-gray-100 text-gray-700' },
];

const MemoryBook = () => {
  const [memories, setMemories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterTag, setFilterTag] = useState('all');
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], description: '', milestone: 'Special Moment' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const res = await memoryAPI.getAll();
        setMemories(res.data);
      } catch (err) { console.error('Failed to fetch memories:', err); }
    };
    fetchMemories();
  }, []);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('date', form.date);
      formData.append('description', form.description);
      formData.append('milestone', form.milestone);
      if (photoFile) formData.append('photo', photoFile);
      await memoryAPI.create(formData);
      const res = await memoryAPI.getAll();
      setMemories(res.data);
      setForm({ title: '', date: new Date().toISOString().split('T')[0], description: '', milestone: 'Special Moment' });
      setPhotoFile(null); setPhotoPreview(''); setShowForm(false);
    } catch (err) { console.error('Failed to save memory:', err); }
    finally { setSaving(false); }
  };

  const deleteMemory = async (id) => {
    try {
      await memoryAPI.delete(id);
      setMemories(memories.filter(m => m._id !== id));
    } catch (err) { console.error('Failed to delete memory:', err); }
  };

  const sorted = [...memories].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filtered = filterTag === 'all' ? sorted : sorted.filter(m => m.milestone === filterTag);
  const getMilestone = (tag) => milestones.find(m => m.tag === tag) || milestones[5];

  const getPhotoUrl = (photo) => {
    if (!photo) return '';
    if (photo.startsWith('/uploads/')) return `/api${photo}`;
    return photo;
  };

  return (
    <div className="pb-bottom-nav">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-800">Memory Book 📖</h1>
            <p className="text-gray-400 text-sm mt-1">{memories.length} memories captured 💕</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className={`p-2.5 rounded-xl transition ${showForm ? 'bg-gray-100 text-gray-500' : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200'}`}>
            {showForm ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 space-y-4 animate-slide-up">
            <input type="text" placeholder="Memory title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 bg-rose-50/50 border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" required />
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 bg-rose-50/50 border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            <textarea placeholder="Describe this moment..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 bg-rose-50/50 border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" rows={3} />
            <div>
              <label className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-dashed border-rose-200 rounded-xl cursor-pointer hover:bg-rose-100 transition">
                <Camera size={18} className="text-rose-400" />
                <span className="text-sm text-rose-500">{photoFile ? 'Photo selected ✓' : 'Add a photo'}</span>
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
              {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-xl" />}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Milestone type</p>
              <div className="flex flex-wrap gap-2">
                {milestones.map(ms => (
                  <button key={ms.tag} type="button" onClick={() => setForm({ ...form, milestone: ms.tag })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${form.milestone === ms.tag ? ms.color + ' ring-2 ring-offset-1 ring-rose-300' : 'bg-gray-50 text-gray-400'}`}>
                    {ms.emoji} {ms.tag}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-rose-200 hover:shadow-xl transition disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Memory 💕'}
            </button>
          </form>
        )}

        {memories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 animate-fade-in">
            <button onClick={() => setFilterTag('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${filterTag === 'all' ? 'bg-rose-500 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>All</button>
            {milestones.map(ms => (
              <button key={ms.tag} onClick={() => setFilterTag(ms.tag)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${filterTag === ms.tag ? ms.color : 'bg-white text-gray-400 border border-gray-100'}`}>
                {ms.emoji} {ms.tag}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <Camera size={48} className="text-rose-200 mx-auto mb-3" />
            <h3 className="font-display text-lg font-semibold text-gray-700">Start capturing your precious moments 📸</h3>
            <p className="text-gray-400 text-sm mt-1">Tap the + button to add your first memory</p>
          </div>
        ) : (
          <div className="relative animate-fade-in">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-rose-200" />
            <div className="space-y-4">
              {filtered.map((memory) => {
                const ms = getMilestone(memory.milestone);
                return (
                  <div key={memory._id} className="relative pl-10">
                    <div className="absolute left-2.5 top-4 w-3 h-3 bg-rose-400 rounded-full border-2 border-white shadow" />
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50 card-hover">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">{formatDate(memory.date)}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ms.color}`}>{ms.emoji} {ms.tag}</span>
                          <button onClick={() => deleteMemory(memory._id)} className="text-gray-300 hover:text-red-400 transition"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">{memory.title}</h3>
                      {memory.description && <p className="text-xs text-gray-500 leading-relaxed mb-2">{memory.description}</p>}
                      {memory.photo && <img src={getPhotoUrl(memory.photo)} alt={memory.title} className="w-full h-40 object-cover rounded-xl" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryBook;
