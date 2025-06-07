
function formatTimestamp(date) {
      return date.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' });
    }

    // Simple keyword-based categorization (simulate AI)
    function categorize(content) {
      const text = content.toLowerCase();
      if (/(project|client|meeting|deadline|work)/.test(text)) return 'Work';
      if (/(mom|friends|party|call|birthday|family)/.test(text)) return 'Personal';
      if (/(idea|plan|innovation|brainstorm|design)/.test(text)) return 'Ideas';
      return 'Misc';
    }

    // Load notes from localStorage
    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    // Render all notes
    function renderNotes() {
      const container = document.getElementById('notesContainer');
      container.innerHTML = '';

      // Get filters
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      const categoryFilter = document.getElementById('categoryFilter').value;

      const filteredNotes = notes.filter(note => {
        const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;
        const matchesSearch = note.title.toLowerCase().includes(searchTerm) || note.content.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
      });

      filteredNotes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.classList.add('note-card');
        noteCard.setAttribute('draggable', 'true');
        noteCard.dataset.id = note.id;

        if(note.isEditing) {
          noteCard.innerHTML = `
            <div class="note-content">
              <input class="edit-title" type="text" value="${note.title}" />
              <textarea class="edit-content">${note.content}</textarea>
            </div>
            <div class="note-footer">
              <span class="category">${note.category}</span>
              <span class="timestamp">${note.timestamp}</span>
            </div>
            <div class="note-actions">
              <button class="save-btn" data-id="${note.id}">Save</button>
              <button class="cancel-btn" data-id="${note.id}">Cancel</button>
            </div>
          `;
        } else {
          noteCard.innerHTML = `
            <div class="note-content">
              <h3>${note.title}</h3>
              <p>${note.content}</p>
            </div>
            <div class="note-footer">
              <span class="category">${note.category}</span>
              <span class="timestamp">${note.timestamp}</span>
            </div>
            <div class="note-actions">
              <button class="edit-btn" data-id="${note.id}">Edit</button>
              <button class="delete-btn" data-id="${note.id}">❌</button>
            </div>
          `;
        }
        container.appendChild(noteCard);
      });
    }

    // Save notes to localStorage
    function saveNotes() {
      localStorage.setItem('notes', JSON.stringify(notes));
    }

    // Add new note
    document.getElementById('noteForm').addEventListener('submit', e => {
      e.preventDefault();
      const titleInput = document.getElementById('noteTitle');
      const contentInput = document.getElementById('noteContent');

      const newNote = {
        id: Date.now().toString(),
        title: titleInput.value.trim(),
        content: contentInput.value.trim(),
        category: categorize(contentInput.value),
        timestamp: formatTimestamp(new Date()),
        isEditing: false
      };

      notes.push(newNote);
      saveNotes();
      renderNotes();

      titleInput.value = '';
      contentInput.value = '';
    });

    // Handle buttons on notes (edit, save, cancel, delete)
    document.getElementById('notesContainer').addEventListener('click', e => {
      const id = e.target.dataset.id;
      if(!id) return;

      if(e.target.classList.contains('edit-btn')) {
        notes = notes.map(note => note.id === id ? {...note, isEditing: true} : {...note, isEditing: false});
        renderNotes();
      } else if(e.target.classList.contains('cancel-btn')) {
        notes = notes.map(note => ({...note, isEditing: false}));
        renderNotes();
      } else if(e.target.classList.contains('save-btn')) {
        const noteCard = e.target.closest('.note-card');
        const newTitle = noteCard.querySelector('.edit-title').value.trim();
        const newContent = noteCard.querySelector('.edit-content').value.trim();

        notes = notes.map(note => {
          if(note.id === id) {
            return {
              ...note,
              title: newTitle,
              content: newContent,
              category: categorize(newContent),
              isEditing: false,
              timestamp: formatTimestamp(new Date())
            };
          }
          return note;
        });

        saveNotes();
        renderNotes();
      } else if(e.target.classList.contains('delete-btn')) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes();
      }
    });

    // Search and filter triggers
    document.getElementById('searchInput').addEventListener('input', renderNotes);
    document.getElementById('categoryFilter').addEventListener('change', renderNotes);

    // Dark mode toggle
    document.getElementById('toggleDarkMode').addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });

    // Initial render
    renderNotes();