
  import { objectType } from '@nexus/schema';

  const User = objectType({
    name: 'User',
    definition(t) {
      t.model.id();
      t.model.username();
      t.model.posts();
    },
  });
  export default User;
