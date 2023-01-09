GRAPHQL_PATH='./graphql/.'

WEB_GQL_PATH='../web/lib/gql/from-shared'
MOBILE_GQL_PATH='../mobile/src/lib/gql/from-shared'

mkdir -p $WEB_GQL_PATH
mkdir -p $MOBILE_GQL_PATH
cp -r $GRAPHQL_PATH $WEB_GQL_PATH
cp -r $GRAPHQL_PATH $MOBILE_GQL_PATH