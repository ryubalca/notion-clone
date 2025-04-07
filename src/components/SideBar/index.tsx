import { FC } from 'react';
import { Item } from './Item';
import { NoteList } from '../NoteList';
import UserItem from './UserItem';
import { Plus, Search } from 'lucide-react';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { useNoteStore } from '@/modules/notes/notes.state';
import { noteRepository } from '@/modules/notes/notes.repository';
import { useNavigate } from 'react-router-dom';
import { authRepository } from '@/modules/auth/auth.repository';

type Props = {
  onSearchButtonClicked: () => void;
};

const SideBar: FC<Props> = ({ onSearchButtonClicked }) => {
  const navigete = useNavigate();
  const currentUserStore  = useCurrentUserStore();
  const notesStore = useNoteStore();

  const createNotes = async () => {
    const newNote = await noteRepository.create(currentUserStore.currentUser!.id, {});
    notesStore.set([newNote]);
    navigete(`/notes/${newNote.id}`);
  }

  const signOut = async () => {
    await authRepository.singout();
    currentUserStore.set(undefined);
    notesStore.clear();
  }

  return (
    <>
      <aside className="group/sidebar h-full bg-neutral-100 overflow-y-auto relative flex flex-col w-60">
        <div>
          <div>
            <UserItem
              user={currentUserStore.currentUser!}
              signout={signOut}
            />
            <Item label="検索" icon={Search} onClick={onSearchButtonClicked} />
          </div>
          <div className="mt-4">
            <NoteList />
            <Item label="ノートを作成" icon={Plus} onClick={createNotes} />
          </div>
        </div>
      </aside>
      <div className="absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]"></div>
    </>
  );
};

export default SideBar;
