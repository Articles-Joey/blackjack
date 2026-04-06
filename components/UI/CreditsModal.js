import { useState } from "react";

import { Modal } from "react-bootstrap"

import ArticlesButton from "./Button";

export default function CreditsModal({
    show,
    setShow,
}) {

    const [showModal, setShowModal] = useState(true)

    return (
        <>

            <Modal
                className="articles-modal games-info-modal"
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
                    <Modal.Title>Credits</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column p-3">

                    {/* <div></div> */}

                    <div>Developed by: ArticlesJoey </div>
                    <div>Published by: Articles Media </div>

                    <div className="mb-3"></div>

                    <div>Attributions:</div>
                    <a
                        href="https://github.com/Articles-Joey/blackjack/blob/main/README.md"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {/* View on GitHub */}
                        <ArticlesButton>
                            <i className="fab fa-github"></i>
                            View on GitHub
                        </ArticlesButton>
                    </a>

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    <div></div>

                    <ArticlesButton variant="outline-dark" onClick={() => {
                        setShow(false)
                    }}>
                        Close
                    </ArticlesButton>

                </Modal.Footer>

            </Modal>
        </>
    )

}