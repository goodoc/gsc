
  import { queryType } from '@nexus/schema';

  export default queryType({
    definition: (t) => {
      t.crud.user();
      t.crud.posts({
        filtering: true,
      });
    },
  });
