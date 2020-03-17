import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { compose } from '@gqlapp/core-common';
import { translate } from '@gqlapp/i18n-client-react';

import UploadView from '../components/UploadView';
import POST_FILES_QUERY from '../graphql/FilesQuery.graphql';
import POST_UPLOAD_FILES from '../graphql/UploadFiles.graphql';
import POST_REMOVE_FILE from '../graphql/RemoveFile.graphql';

const Upload = props => {
  const { postUploadFiles, postRemoveFile } = props;
  const [error, setError] = useState(null);

  const handleUploadFiles = async files => {
    try {
      await postUploadFiles(files);
      localStorage.setItem('imageName', files[0].name);
    } catch (e) {
      setError({ error: e.message });
    }
  };

  const handleRemoveFile = async id => {
    try {
      await postRemoveFile(id);
    } catch (e) {
      setError({ error: e.message });
    }
  };

  return (
    <UploadView {...props} error={error} handleRemoveFile={handleRemoveFile} handleUploadFiles={handleUploadFiles} />
  );
};

Upload.propTypes = {
  postUploadFiles: PropTypes.func,
  postRemoveFile: PropTypes.func
};

export default compose(
  graphql(POST_FILES_QUERY, {
    options: () => {
      return {
        fetchPolicy: 'cache-and-network'
      };
    },
    props({ data: { loading, error, files } }) {
      if (error) throw new Error(error);

      return { loading, files };
    }
  }),
  graphql(POST_UPLOAD_FILES, {
    props: ({ mutate }) => ({
      postUploadFiles: async postFiles => {
        const {
          data: { postUploadFiles }
        } = await mutate({
          variables: { postFiles },
          refetchQueries: [{ query: POST_FILES_QUERY }]
        });

        return postUploadFiles;
      }
    })
  }),
  graphql(POST_REMOVE_FILE, {
    props: ({ mutate }) => ({
      postRemoveFile: async id => {
        const {
          data: { postRemoveFile }
        } = await mutate({
          variables: { id },
          optimisticResponse: {
            __typename: 'Mutation',
            postRemoveFile: {
              postRemoveFile: true,
              __typename: 'File'
            }
          },
          update: store => {
            const cachedFiles = store.readQuery({ query: POST_FILES_QUERY });

            store.writeQuery({
              query: POST_FILES_QUERY,
              data: { files: cachedFiles.files.filter(file => file.id !== id) }
            });
          }
        });
        return postRemoveFile;
      }
    })
  }),
  translate('upload')
)(Upload);
