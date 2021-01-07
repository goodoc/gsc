
  import { mutationType } from '@nexus/schema';

  export default mutationType({
    definition: (t) => {
      t.crud.createOnePost();
    },
  });
