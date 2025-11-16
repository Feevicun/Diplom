import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  StickyNote,
  Eye,
  Bookmark,
  FileText,
  MoreHorizontal,
  X,
  ChevronDown,
  Grid3X3,
  List,
  SortAsc,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  ListTodo,
  Save,
  ArrowLeft,
  Image,
  GripVertical,
} from "lucide-react";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  isBookmarked: boolean;
  isPublic: boolean;
  updatedAt: string;
  wordCount: number;
  backgroundColor?: string;
  textColor?: string;
  images?: string[];
  displayOrder?: number;
}

const NotesPage = () => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [showPublic, setShowPublic] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "title" | "wordCount" | "custom">("custom");
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    category: "personal",
    isBookmarked: false,
    isPublic: false,
    backgroundColor: "#ffffff",
    textColor: "#000000",
    images: [] as string[],
  });
  
  const [currentTag, setCurrentTag] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Завантаження нотаток з API
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notes", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const notesData = await response.json();
        // Сортуємо нотатки за display_order
        const sortedNotes = notesData.sort((a: Note, b: Note) => 
          (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        setNotes(sortedNotes);
      } else {
        console.error("Failed to fetch notes");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Отримання унікальних категорій та тегів
  const categories = Array.from(new Set(notes.map(note => note.category)));
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // Фільтрація та сортування нотаток
  useEffect(() => {
    let filtered = notes;

    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((note) => selectedCategories.includes(note.category));
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((note) => 
        selectedTags.some(tag => note.tags.includes(tag))
      );
    }

    if (showBookmarked) {
      filtered = filtered.filter((note) => note.isBookmarked);
    }

    if (showPublic) {
      filtered = filtered.filter((note) => note.isPublic);
    }

    // Сортування
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "custom") {
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      }

      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "wordCount":
          aValue = a.wordCount;
          bValue = b.wordCount;
          break;
        case "date":
        default:
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredNotes(filtered);
  }, [notes, searchQuery, selectedCategories, selectedTags, showBookmarked, showPublic, sortBy, sortOrder]);

  // Функції для перегляду нотаток
  const openPreview = (note: Note) => {
    setPreviewNote(note);
  };

  const closePreview = () => {
    setPreviewNote(null);
  };

  // Функції для перетягування
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    // Додаємо візуальний ефект перетягування
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Перевіряємо, чи ми дійсно вийшли з елемента, а не просто перейшли на дочірній
    const relatedTarget = e.relatedTarget as Node;
    const currentTarget = e.currentTarget as Node;
    
    if (!currentTarget.contains(relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    setDragOverIndex(null);
    // Видаляємо візуальний ефект
    e.currentTarget.classList.remove('opacity-50');
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    setDragOverIndex(null);

    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      // Оновлюємо відфільтровані нотатки
      const newFilteredNotes = [...filteredNotes];
      const draggedItem = newFilteredNotes[dragItem.current];
      
      // Видаляємо елемент з поточної позиції
      newFilteredNotes.splice(dragItem.current, 1);
      // Вставляємо на нову позицію
      newFilteredNotes.splice(dragOverItem.current, 0, draggedItem);
      
      setFilteredNotes(newFilteredNotes);
      
      // Оновлюємо основний масив нотаток з новим порядком
      const updatedNotes = [...notes];
      
      // Знаходимо ID нотаток у новому порядку
      const newOrderIds = newFilteredNotes.map(note => note.id);
      
      // Оновлюємо displayOrder для всіх нотаток
      const reorderedNotes = updatedNotes.map(note => ({
        ...note,
        displayOrder: newOrderIds.indexOf(note.id)
      })).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      setNotes(reorderedNotes);
      
      // Оновлюємо порядок на бекенді
      await updateNoteOrder(newOrderIds);
    }
    
    // Видаляємо візуальний ефект
    e.currentTarget.classList.remove('opacity-50');
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const updateNoteOrder = async (noteOrder: string[]) => {
    try {
      const response = await fetch("/api/notes/order", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ noteOrder })
      });
      
      if (!response.ok) {
        console.error("Failed to update note order");
      } else {
        console.log("Note order updated successfully");
      }
    } catch (error) {
      console.error("Error updating note order:", error);
    }
  };

  // Функції для роботи з нотатками
  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    
    try {
      const response = await fetch(`/api/notes/${noteToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setNotes(prev => prev.filter((note) => note.id !== noteToDelete));
        if (previewNote?.id === noteToDelete) {
          closePreview();
        }
      } else {
        console.error("Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const startDeleting = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const toggleBookmark = async (noteId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/bookmark`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isBookmarked: !currentStatus })
      });
      
      if (response.ok) {
        setNotes(prev => prev.map(note => 
          note.id === noteId ? { ...note, isBookmarked: !currentStatus } : note
        ));
        if (previewNote?.id === noteId) {
          setPreviewNote(prev => prev ? { ...prev, isBookmarked: !currentStatus } : null);
        }
      } else {
        console.error("Failed to update bookmark");
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  const toggleVisibility = async (noteId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isPublic: !currentStatus })
      });
      
      if (response.ok) {
        setNotes(prev => prev.map(note => 
          note.id === noteId ? { ...note, isPublic: !currentStatus } : note
        ));
        if (previewNote?.id === noteId) {
          setPreviewNote(prev => prev ? { ...prev, isPublic: !currentStatus } : null);
        }
      } else {
        console.error("Failed to update visibility");
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };

  const startEditingNote = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      tags: [...note.tags],
      category: note.category,
      isBookmarked: note.isBookmarked,
      isPublic: note.isPublic,
      backgroundColor: note.backgroundColor || "#ffffff",
      textColor: note.textColor || "#000000",
      images: note.images || [],
    });
    setIsCreatingNote(true);
    closePreview();
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) {
      alert(t('notes.validation.titleRequired'));
      return;
    }

    try {
      setSaveLoading(true);
      
      // Підготовка даних для відправки
      const noteData = {
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags,
        category: newNote.category,
        isBookmarked: newNote.isBookmarked,
        isPublic: newNote.isPublic,
        backgroundColor: newNote.backgroundColor,
        textColor: newNote.textColor,
        images: newNote.images,
      };

      const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes';
      const method = editingNote ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(noteData)
      });
      
      if (response.ok) {
        const savedNote = await response.json();
        
        if (editingNote) {
          setNotes(prev => prev.map(n => n.id === editingNote.id ? savedNote : n));
        } else {
          // Для нової нотатки додаємо displayOrder
          const noteWithOrder = { ...savedNote, displayOrder: notes.length };
          setNotes(prev => [noteWithOrder, ...prev]);
        }
        
        cancelEditing();
        await fetchNotes();
      } else {
        const errorText = await response.text();
        console.error("Failed to save note:", response.status, errorText);
        alert(`Помилка збереження: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert(t('notes.messages.saveError'));
    } finally {
      setSaveLoading(false);
    }
  };

  const cancelEditing = () => {
    setNewNote({
      title: "",
      content: "",
      tags: [],
      category: "personal",
      isBookmarked: false,
      isPublic: false,
      backgroundColor: "#ffffff",
      textColor: "#000000",
      images: [],
    });
    setEditingNote(null);
    setIsCreatingNote(false);
  };

  const addTag = () => {
    if (currentTag && !newNote.tags.includes(currentTag)) {
      setNewNote(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag]
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Функції для редактора тексту
  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    updateEditorContent();
  };

  const updateEditorContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setNewNote(prev => ({ ...prev, content }));
    }
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const content = target.innerHTML;
    setNewNote(prev => ({ ...prev, content }));
  };

  const handleEditorPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    updateEditorContent();
  };

  const changeTextColor = (color: string) => {
    setNewNote(prev => ({ ...prev, textColor: color }));
    formatText('styleWithCSS', 'true');
    formatText('foreColor', color);
  };

  const changeBackgroundColor = (color: string) => {
    setNewNote(prev => ({ ...prev, backgroundColor: color }));
    if (editorRef.current) {
      editorRef.current.style.backgroundColor = color;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setNewNote(prev => ({
          ...prev,
          images: [...prev.images, imageUrl]
        }));
        
        // Вставка зображення в редактор
        if (editorRef.current) {
          const img = document.createElement('img');
          img.src = imageUrl;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.margin = '10px 0';
          document.execCommand('insertHTML', false, img.outerHTML);
          updateEditorContent();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setShowBookmarked(false);
    setShowPublic(false);
    setSearchQuery("");
  };

  const getCategoryName = (category: string) => {
    return t(`notes.categories.${category}`) || category;
  };

  // ОНОВЛЕНО: Покращені кольори для темної теми
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "personal":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30";
      case "work":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 border border-green-200 dark:border-green-500/30";
      case "study":
        return "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30";
      case "ideas":
        return "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30";
    }
  };

  // ОНОВЛЕНО: Покращені кольори для тегів
  const getTagColors = () => {
    return "bg-gray-100 text-gray-700 dark:bg-gray-600/40 dark:text-gray-200 border border-gray-200 dark:border-gray-500/30 hover:bg-gray-200 dark:hover:bg-gray-500/40";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const textColors = [
    "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", 
    "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080"
  ];

  const backgroundColors = [
    "#ffffff", "#ffffcc", "#ccffcc", "#ccccff", "#ffcccc",
    "#ffcc99", "#e6e6fa", "#f0fff0", "#f5f5dc", "#f0f8ff"
  ];

  const activeFiltersCount = selectedCategories.length + selectedTags.length + (showBookmarked ? 1 : 0) + (showPublic ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">{t('notes.messages.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isCreatingNote) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col h-screen">
          <div className="sticky top-0 z-10 bg-card border-b border-border">
            <Header />
          </div>

          <main className="flex-1 overflow-y-auto bg-background">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
              {/* Заголовок редактора */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={cancelEditing}
                    className="h-9 w-9"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {editingNote ? t('notes.editor.editNote') : t('notes.editor.newNote')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {editingNote ? 'Оновіть вміст вашої нотатки' : 'Створіть нову нотатку'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newNote.isPublic}
                      onCheckedChange={(checked) => setNewNote(prev => ({ ...prev, isPublic: checked }))}
                    />
                    <div className="flex items-center gap-1 text-sm">
                      <Eye className="h-4 w-4" />
                      {t('notes.editor.public')}
                    </div>
                  </div>
                  <Button
                    variant={newNote.isBookmarked ? "default" : "outline"}
                    size="icon"
                    onClick={() => setNewNote(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }))}
                  >
                    <Bookmark className={`h-4 w-4 ${newNote.isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button 
                    onClick={handleCreateNote} 
                    className="gap-2"
                    disabled={saveLoading}
                  >
                    <Save className="h-4 w-4" />
                    {saveLoading ? t('notes.button.saving') : t('notes.button.save')}
                  </Button>
                </div>
              </div>

              {/* Форма створення нотатки */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Бічна панель */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('notes.editor.category')}</label>
                      <Select 
                        value={newNote.category} 
                        onValueChange={(value) => setNewNote(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">{t('notes.categories.personal')}</SelectItem>
                          <SelectItem value="work">{t('notes.categories.work')}</SelectItem>
                          <SelectItem value="study">{t('notes.categories.study')}</SelectItem>
                          <SelectItem value="ideas">{t('notes.categories.ideas')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('notes.editor.tags')}</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t('notes.editor.addTag')}
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="h-9"
                        />
                        <Button onClick={addTag} size="sm" className="h-9">
                          {t('notes.button.add')}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {newNote.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className={`gap-1 ${getTagColors()}`}>
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Налаштування кольорів */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-medium text-sm">{t('notes.editor.colors')}</h3>
                    
                    <div className="space-y-2">
                      <label className="text-xs">{t('notes.editor.textColor')}</label>
                      <div className="flex flex-wrap gap-1">
                        {textColors.map(color => (
                          <button
                            key={color}
                            className={`w-6 h-6 rounded border ${
                              newNote.textColor === color ? 'ring-2 ring-primary' : ''
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => changeTextColor(color)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs">{t('notes.editor.backgroundColor')}</label>
                      <div className="flex flex-wrap gap-1">
                        {backgroundColors.map(bg => (
                          <button
                            key={bg}
                            className={`w-6 h-6 rounded border ${
                              newNote.backgroundColor === bg ? 'ring-2 ring-primary' : ''
                            }`}
                            style={{ backgroundColor: bg }}
                            onClick={() => changeBackgroundColor(bg)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Область редагування */}
                <div className="lg:col-span-3 space-y-4">
                  <Input
                    placeholder={t('notes.editor.title')}
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    className="text-2xl font-bold border-0 focus-visible:ring-0 p-0"
                  />

                  {/* Панель інструментів редактора */}
                  <div className="border rounded-lg p-3 bg-card">
                    <div className="flex flex-wrap gap-1">
                      {/* Стилі тексту */}
                      <Toggle size="sm" onClick={() => formatText('bold')} title={t('notes.editor.textStyles.bold')}>
                        <Bold className="h-4 w-4" />
                      </Toggle>
                      <Toggle size="sm" onClick={() => formatText('italic')} title={t('notes.editor.textStyles.italic')}>
                        <Italic className="h-4 w-4" />
                      </Toggle>
                      <Toggle size="sm" onClick={() => formatText('underline')} title={t('notes.editor.textStyles.underline')}>
                        <Underline className="h-4 w-4" />
                      </Toggle>
                      
                      <div className="w-px bg-border mx-1" />

                      {/* Вирівнювання */}
                      <Toggle size="sm" onClick={() => formatText('justifyLeft')} title={t('notes.editor.alignment.left')}>
                        <AlignLeft className="h-4 w-4" />
                      </Toggle>
                      <Toggle size="sm" onClick={() => formatText('justifyCenter')} title={t('notes.editor.alignment.center')}>
                        <AlignCenter className="h-4 w-4" />
                      </Toggle>
                      <Toggle size="sm" onClick={() => formatText('justifyRight')} title={t('notes.editor.alignment.right')}>
                        <AlignRight className="h-4 w-4" />
                      </Toggle>

                      <div className="w-px bg-border mx-1" />

                      {/* Списки */}
                      <Toggle size="sm" onClick={() => formatText('insertUnorderedList')} title={t('notes.editor.lists.unordered')}>
                        <ListTodo className="h-4 w-4" />
                      </Toggle>
                      <Toggle size="sm" onClick={() => formatText('insertOrderedList')} title={t('notes.editor.lists.ordered')}>
                        <ListOrdered className="h-4 w-4" />
                      </Toggle>

                      <div className="w-px bg-border mx-1" />

                      {/* Завантаження зображень */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Toggle size="sm" asChild>
                          <span className="cursor-pointer" title={t('notes.editor.image')}>
                            <Image className="h-4 w-4" />
                          </span>
                        </Toggle>
                      </label>
                    </div>
                  </div>

                  {/* Редактор тексту */}
                  <div
                    ref={editorRef}
                    contentEditable
                    className="min-h-[500px] p-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{
                      backgroundColor: newNote.backgroundColor,
                      color: newNote.textColor,
                    }}
                    onInput={handleEditorInput}
                    onPaste={handleEditorPaste}
                    dangerouslySetInnerHTML={{ __html: newNote.content }}
                  />
                  
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{newNote.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} {t('notes.editor.words')}</span>
                    <span>{newNote.content.replace(/<[^>]*>/g, '').length} {t('notes.editor.characters')}</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-card border-b border-border">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Заголовок з іконкою та описом */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <StickyNote className="text-primary w-7 h-7" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{t('notes.pageTitle')}</h1>
                  <p className="text-muted-foreground text-sm">
                    {t('notes.pageDescription')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
                  <TabsList className="h-9">
                    <TabsTrigger value="grid" className="h-7 text-xs">
                      <Grid3X3 className="h-3 w-3 mr-1" />
                      {t('notes.viewMode.grid')}
                    </TabsTrigger>
                    <TabsTrigger value="list" className="h-7 text-xs">
                      <List className="h-3 w-3 mr-1" />
                      {t('notes.viewMode.list')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button 
                  onClick={() => setIsCreatingNote(true)} 
                  className="px-4 py-2 shadow-md" 
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('notes.button.newNote')}
                </Button>
              </div>
            </div>

            {/* Пошук та фільтри */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="search"
                        placeholder={t('notes.search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-9 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-9 gap-1">
                            <SortAsc className="h-4 w-4" />
                            {t('notes.sort.title')}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuCheckboxItem
                            checked={sortBy === "custom"}
                            onCheckedChange={() => setSortBy("custom")}
                          >
                            {t('notes.sort.custom')}
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={sortBy === "date"}
                            onCheckedChange={() => setSortBy("date")}
                          >
                            {t('notes.sort.date')}
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={sortBy === "title"}
                            onCheckedChange={() => setSortBy("title")}
                          >
                            {t('notes.sort.title')}
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={sortBy === "wordCount"}
                            onCheckedChange={() => setSortBy("wordCount")}
                          >
                            {t('notes.sort.wordCount')}
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-9 w-9 relative"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <Filter className="h-4 w-4" />
                        {activeFiltersCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                            {activeFiltersCount}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>

                  {showFilters && (
                    <div className="border-t pt-4 space-y-4">
                      <div className="flex flex-wrap gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t('notes.filters.categories')}</label>
                          <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                              <Badge
                                key={category}
                                variant={selectedCategories.includes(category) ? "default" : "outline"}
                                className={`cursor-pointer ${getCategoryColor(category)}`}
                                onClick={() => toggleCategory(category)}
                              >
                                {getCategoryName(category)}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t('notes.filters.tags')}</label>
                          <div className="flex flex-wrap gap-2">
                            {allTags.slice(0, 10).map(tag => (
                              <Badge
                                key={tag}
                                variant={selectedTags.includes(tag) ? "default" : "outline"}
                                className={`cursor-pointer ${getTagColors()}`}
                                onClick={() => toggleTag(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={showBookmarked}
                            onCheckedChange={setShowBookmarked}
                          />
                          <label className="text-sm">{t('notes.filters.bookmarks')}</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={showPublic}
                            onCheckedChange={setShowPublic}
                          />
                          <label className="text-sm">{t('notes.filters.public')}</label>
                        </div>
                      </div>

                      {activeFiltersCount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {t('notes.filters.activeFilters')}: {activeFiltersCount}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="h-8 text-sm"
                          >
                            <X className="h-3 w-3 mr-1" />
                            {t('notes.button.clearAll')}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Список нотаток */}
            <div className={`gap-4 ${
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "space-y-3"
            }`}>
              {filteredNotes.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                    <StickyNote className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t('notes.emptyState.title')}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md text-sm">
                    {t('notes.emptyState.description')}
                  </p>
                  <Button onClick={() => setIsCreatingNote(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('notes.emptyState.button')}
                  </Button>
                </div>
              ) : (
                filteredNotes.map((note, index) => (
                  viewMode === "grid" ? (
                    <Card 
                      key={note.id} 
                      className={`hover:shadow-md transition-all group border relative ${
                        dragOverIndex === index ? 'ring-2 ring-primary bg-primary/5 scale-105' : ''
                      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} transition-transform duration-200`}
                      style={{ 
                        backgroundColor: note.backgroundColor,
                        color: note.textColor
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 pr-2">
                            <CardTitle 
                              className="text-base mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                              onClick={() => openPreview(note)}
                            >
                              {note.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getCategoryColor(note.category)}`}
                              >
                                {getCategoryName(note.category)}
                              </Badge>
                              {note.isBookmarked && (
                                <Bookmark className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              )}
                              {note.isPublic && (
                                <Eye className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => startEditingNote(note)}>
                                {t('notes.actions.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleBookmark(note.id, note.isBookmarked)}>
                                {note.isBookmarked ? t('notes.actions.removeBookmark') : t('notes.actions.toggleBookmark')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleVisibility(note.id, note.isPublic)}>
                                {note.isPublic ? t('notes.actions.makePrivate') : t('notes.actions.makePublic')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => startDeleting(note.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('notes.actions.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div 
                          className="line-clamp-3 text-sm leading-relaxed cursor-pointer"
                          style={{ color: note.textColor }}
                          onClick={() => openPreview(note)}
                          dangerouslySetInnerHTML={{ __html: note.content }}
                        />

                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {note.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className={`text-xs px-2 py-0.5 font-normal ${getTagColors()}`}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>{note.wordCount} {t('notes.preview.words')}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t('notes.preview.updated')}: {formatDate(note.updatedAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card 
                      key={note.id} 
                      className={`hover:shadow-md transition-all border relative ${
                        dragOverIndex === index ? 'ring-2 ring-primary bg-primary/5 scale-105' : ''
                      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} transition-transform duration-200`}
                      style={{ 
                        backgroundColor: note.backgroundColor,
                        color: note.textColor
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle 
                                  className="text-base truncate cursor-pointer hover:text-primary transition-colors"
                                  onClick={() => openPreview(note)}
                                >
                                  {note.title}
                                </CardTitle>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${getCategoryColor(note.category)}`}
                                >
                                  {getCategoryName(note.category)}
                                </Badge>
                                {note.isBookmarked && (
                                  <Bookmark className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                )}
                                {note.isPublic && (
                                  <Eye className="h-3 w-3 text-blue-500" />
                                )}
                              </div>
                              <div 
                                className="text-sm line-clamp-1 cursor-pointer"
                                style={{ color: note.textColor }}
                                onClick={() => openPreview(note)}
                                dangerouslySetInnerHTML={{ __html: note.content }}
                              />
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  <span>{note.wordCount} {t('notes.preview.words')}</span>
                                </div>
                                <span>{t('notes.preview.updated')}: {formatDate(note.updatedAt)}</span>
                                {note.tags.slice(0, 2).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className={`text-xs px-2 py-0.5 font-normal ${getTagColors()}`}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {note.tags.length > 2 && (
                                  <span className="text-xs">+{note.tags.length - 2}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => startEditingNote(note)}>
                                {t('notes.actions.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleBookmark(note.id, note.isBookmarked)}>
                                {note.isBookmarked ? t('notes.actions.removeBookmark') : t('notes.actions.toggleBookmark')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleVisibility(note.id, note.isPublic)}>
                                {note.isPublic ? t('notes.actions.makePrivate') : t('notes.actions.makePublic')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => startDeleting(note.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('notes.actions.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Діалог перегляду нотатки */}
      <Dialog open={!!previewNote} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{previewNote?.title}</DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className={previewNote ? getCategoryColor(previewNote.category) : ''}
              >
                {previewNote ? getCategoryName(previewNote.category) : ''}
              </Badge>
              {previewNote?.isBookmarked && (
                <Bookmark className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
              {previewNote?.isPublic && (
                <Eye className="h-4 w-4 text-blue-500" />
              )}
            </div>
          </DialogHeader>
          
          <div 
            className="prose prose-lg max-w-none p-6 rounded-lg border min-h-[300px]"
            style={{
              backgroundColor: previewNote?.backgroundColor,
              color: previewNote?.textColor
            }}
            dangerouslySetInnerHTML={{ __html: previewNote?.content || '' }}
          />
          
          {previewNote && previewNote.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {previewNote.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`text-sm ${getTagColors()}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t mt-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{previewNote?.wordCount || 0} {t('notes.preview.words')}</span>
              </div>
              <span>{t('notes.preview.updated')}: {previewNote ? formatDate(previewNote.updatedAt) : ''}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Діалог підтвердження видалення */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mb-3">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            
            <AlertDialogTitle className="text-lg font-semibold mb-2">
              {t('notes.deleteDialog.title')}
            </AlertDialogTitle>
            
            <AlertDialogDescription className="text-sm mb-4">
              {t('notes.deleteDialog.description')}
            </AlertDialogDescription>

            <div className="flex gap-2 w-full">
              <AlertDialogCancel className="flex-1 h-9 text-sm">
                {t('notes.deleteDialog.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteNote}
                className="flex-1 h-9 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                {t('notes.deleteDialog.delete')}
              </AlertDialogAction>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotesPage;