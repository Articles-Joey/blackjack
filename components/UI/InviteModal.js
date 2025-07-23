import { useState, useMemo } from "react";

// import { useSelector } from 'react-redux';

import { Modal } from "react-bootstrap"

import ViewUserModal from "@/components/UI/ViewUserModal"

import ArticlesDate from "@/components/UI/ArticlesDate";
// import ConfirmDelete from "../ConfirmDelete";
import ArticlesButton from "./Button";
// import UserProfilePhoto from "../SiteLayout/UserProfilePhoto";
import useUserFriends from "@/hooks/user/useUserFriends";

function InviteModal({
    show,
    setShow,
}) {

    const [showModal, setShowModal] = useState(true)

    const [lightboxData, setLightboxData] = useState(null)

    // const userReduxState = useSelector((state) => state.auth.user_details)
    // const reduxUserConversations = useSelector((state) => state.messages.conversations.conversations)

    const { data: userFriends, isLoading: userFriendsIsLoading, mutate: userFriendsMutate } = useUserFriends()

    const [friendsSearch, setFriendsSearch] = useState('')

    const [sentMessages, setSentMessages] = useState([])

    console.log("InviteModal RENDER")

    return (
        <>
            {/* {lightboxData && (
                <Lightbox
                    mainSrc={lightboxData?.location}
                    onCloseRequest={() => setLightboxData(null)}
                    reactModalStyle={{
                        overlay: {
                            zIndex: '2000'
                        }
                    }}
                />
            )} */}

            <Modal
                className="articles-modal"
                size='md'
                show={showModal}
                centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Invite Players</Modal.Title>
                </Modal.Header>

                <Modal.Body className="p-0">

                    {show.type ?
                        <div>

                            <div className="sticky-top">
                                <div className="card rounded-0">
                                    <div className="card-header d-flex justify-content-center">
                                        <div
                                            className={`form-group articles mb-0 w-100`}
                                            style={{ maxWidth: '250px' }}
                                        >
                                            <label className="">Friend Search:</label>
                                            <input
                                                type="text"
                                                placeholder={"Display name or username"}
                                                value={friendsSearch}
                                                onChange={(e) => {

                                                    setFriendsSearch(e.target.value)

                                                }}
                                                className={`form-control form-control-sm`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex">

                                <div className="d-flex flex-column w-50 p-2 ">

                                    <div>Type</div>
                                    <div className="mb-2 fw-bold">{show.type}</div>

                                    <div>Game Name</div>
                                    <div className="mb-2 fw-bold">{show.game_name}</div>

                                    <div>Server Id</div>
                                    <div className="mb-2 fw-bold">{show.server_id}</div>

                                </div>

                                <div className="d-flex flex-column w-50 border-start border-dark p-2">
                                    <div className="text-muted">Invited Players</div>
                                    <div className="invited-users">
                                        {sentMessages.map(sent_obj => {
                                            return (
                                                <ViewUserModal
                                                    key={sent_obj._id}
                                                    user_id={sent_obj.populated_user._id}
                                                    populated_user={sent_obj.populated_user}
                                                    className="mb-1"
                                                />
                                            )
                                        })}
                                    </div>
                                </div>

                            </div>

                            <div className='friends border-top '>
                                {userFriends
                                    ?.filter(user_obj => {

                                        if (friendsSearch) {

                                            return user_obj.populated_user.display_name?.toLowerCase().includes(friendsSearch?.toLowerCase())

                                        } else {
                                            return user_obj
                                        }

                                    })
                                    .map(user_obj => {

                                        return (
                                            <div key={user_obj._id} className="border-bottom p-2 py-2">

                                                <div className='d-flex align-items-center'>

                                                    {/* TODO */}
                                                    {/* <UserProfilePhoto
                                                        width={'50px'}
                                                        profile_photo={user_obj?.populated_user?.profile_photo}
                                                    /> */}

                                                    <div className='ms-2'>

                                                        <ViewUserModal
                                                            user_id={user_obj.populated_user._id}
                                                            populated_user={user_obj.populated_user}
                                                        // hidePhoto
                                                        />

                                                        <div className='small'>@{user_obj.populated_user.username}</div>

                                                        <div className="small">
                                                            <div className="small">
                                                                Added: <ArticlesDate date={user_obj.date} format={'PP'} />
                                                            </div>
                                                        </div>

                                                    </div>

                                                    <ArticlesButton
                                                        small
                                                        className="ms-auto"
                                                        disabled={sentMessages.find(sent_obj => sent_obj._id == user_obj._id)}
                                                        onClick={() => {

                                                            setSentMessages(prev => [
                                                                ...prev,
                                                                {
                                                                    _id: user_obj._id,
                                                                    populated_user: user_obj.populated_user
                                                                }
                                                            ])
                                                            return

                                                            axios.post('/api/user/messages/send', {
                                                                // conversation_id: conversation._id,
                                                                // message: message,
                                                                // socket_id: articlesSocket.id
                                                            })
                                                                .then(function (response) {
                                                                    console.log(response.data);

                                                                    // setSentMessages(prev => [
                                                                    //     ...prev,
                                                                    //     conversation._id
                                                                    // ])

                                                                })
                                                                .catch(function (error) {
                                                                    alert(error.response.data)
                                                                    console.log(error);
                                                                });
                                                        }}
                                                    >
                                                        {sentMessages.find(sent_obj => sent_obj._id == user_obj._id) ? "Sent" : "Invite"}
                                                    </ArticlesButton>

                                                    {/* <div className="ms-auto">

                                                        <ConfirmDelete
                                                            type={"Button"}
                                                            textOverride={"Remove"}
                                                            afterConfirm={() => {
                                                                removeFriend(user_obj._id)
                                                            }}
                                                        />

                                                    </div> */}

                                                </div>

                                            </div>
                                        )

                                    })}
                            </div>

                        </div>
                        :
                        <div className="p-3">
                            <div>Dev Issue</div>
                        </div>
                    }

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    {/* <div></div> */}


                    <div>

                        <ArticlesButton variant="outline-dark" onClick={() => {
                            setShow(false)
                        }}>
                            Close
                        </ArticlesButton>

                    </div>


                    {/* <ArticlesButton variant="success" onClick={() => setValue(false)}>
                    Save
                </ArticlesButton> */}

                </Modal.Footer>

            </Modal>
        </>
    )

}

const InviteModalMemo = ({ show, setShow }) => {

    // const [inputValue, setInputValue] = useState('');

    const expensiveValue = useMemo(
        () => <InviteModal show={show} setShow={setShow} />,
        [show]
    );

    return expensiveValue;

};

//   export default InviteModal
export default InviteModalMemo