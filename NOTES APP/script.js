const textarea = document.getElementById('note-input');
const preview = document.getElementById('preview');

window.onload = () => {
  const saved = localStorage.getItem('markdownNote');
  if (saved) {
    textarea.value = saved;
    updatePreview(saved);
  }
};

textarea.addEventListener('input', () => {
  updatePreview(textarea.value);
});

function updatePreview(text) {
  preview.innerHTML = marked.parse(text);
}

function saveNote() {
  const note = textarea.value;
  localStorage.setItem('markdownNote', note);
  alert('✅ Your note has been saved!');
}

function exportNote() {
  const note = textarea.value;
  const blob = new Blob([note], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = 'markdown-note.txt';
  link.href = URL.createObjectURL(blob);
  link.click();
}
