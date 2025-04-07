import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import SideBar from './components/SideBar';
import { SearchModal } from './components/SearchModal';
import { useCurrentUserStore } from './modules/auth/current-user.state';
import { useNoteStore } from './modules/notes/notes.state';
import { useEffect, useState } from 'react';
import { noteRepository } from './modules/notes/notes.repository';
import { Note } from './modules/notes/notes.entity';
import { subscribe, unsubscribe } from './lib/supabase';

const Layout = () => {
  const navigate = useNavigate();
  const {currentUser} = useCurrentUserStore();
  const noteStore = useNoteStore();
  const [isloading, setIsLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const [searchResults, setSearchResults] = useState<Note[]>([]);

  const fetchNote = async () => {
    setIsLoading(true);
    const notes = await noteRepository.find(currentUser!.id);
    if (notes === null) return;
    noteStore.set(notes);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchNote();
    const channel = subscribeNote();
    return () => {
      unsubscribe(channel!);
    }
  },[])

  const searchNotes = async (keyword: string) => {
    const notes = await noteRepository.findByKeyword(currentUser!.id, keyword);
    if (notes == null) return;
    noteStore.set(notes);
    setSearchResults(notes);
  }

  const moveToDetail = (noteId: number) => {
    navigate(`/notes/${noteId}`);
    setIsShowModal(false);
  }

  const subscribeNote = () => {
    if (currentUser == null) return;
    return subscribe(currentUser!.id, (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        noteStore.set([payload.new]);
      }  else if (payload.eventType === 'DELETE') {
        noteStore.delete(payload.old.id!);
      }
    })
  }

  if (currentUser == null) return <Navigate replace to="/signin" />;

  return (
    <div className="h-full flex">
      {!isloading && <SideBar onSearchButtonClicked={() => setIsShowModal(true)} />}
      <main className="flex-1 h-full overflow-y-auto">
        <Outlet />
        <SearchModal
          isOpen={isShowModal}
          notes={searchResults}
          onItemSelect={moveToDetail}
          onKeywordChanged={searchNotes}
          onClose={() => setIsShowModal(false)}
        />
      </main>
    </div>
  );
};

export default Layout;
