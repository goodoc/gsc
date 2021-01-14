
  import { objectType } from '@nexus/schema';

  const Post = objectType({
    name: 'Post',
    definition(t) {
      t.model.id();
      t.model.title();
      t.model.content();
      t.model.writer();
    },
  });
  export default Post;
