import minimalMongodbUserProject from "util/mongodbUserProjects/minimal"

const mongodbUserProject = {
    ...minimalMongodbUserProject,
    
    'political.party_id': 1,
    'roles': 1,
    'verified': 1,
    'articles_membership': 1
}

export default mongodbUserProject