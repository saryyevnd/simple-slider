import "./styles.scss";
import { multiplyArray } from "./utils";
import { keyGenerator } from "./utils/keyGenerator";
import { _setHandleAutoControl, _slideEventHandler } from "./functions";
import React, { Children, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    _onHandleMouseDown,
    _onHandleMouseMove,
    _onHandleMouseUp,
    _onHandleTouchEnd,
    _onHandleTouchMove,
    _onHandleTouchStart
} from "./functions/eventHandlers";
import { useScreenSize } from "./utils/useScreen";

const SimpleSlider = memo(({
    children,
    direction = "left",
    frequency = 0,
    speed = 200
}) => {
    const { isSmall } = useScreenSize();
    let slidesToShow = isSmall ? 1 : 2;
    let moveLeft = isSmall ? 0 : 1 / 2;
    let FREQUENCY = frequency === 0 ? 0 : (frequency < 300) ? 300 : frequency;
    // Variables start
    const COUNT_OF_CHILDS = children?.length || 0;
    let memorizedChilds = useMemo(() => children && multiplyArray(children), [children]);
    let memorizedKeys = useMemo(() => keyGenerator(COUNT_OF_CHILDS), [COUNT_OF_CHILDS]);
    const memory = useRef({
        MOUSE_DOWN_X: 0,
        MOUSE_MOVE_X: 0,
        MOUSE_DOWN_CLIENT_X: 0
    });
    const counter = useRef(0);
    const isBlocked = useRef(false);
    const sliderCards = useRef(null);
    const sliderTrack = useRef(null);
    const prevSliderTrackStyles = useRef({});
    const [sliderCardsWidth, setSliderCardsWidth] = useState(0);
    const [sliderTrackStyles, setSliderTrackStyles] = useState({});
    const interval = useRef(null);
    // Variables End

    // RETURN DEFAULT
    const setHandleAutoControl = useCallback(() => {
        _setHandleAutoControl(
            counter,
            sliderCards,
            COUNT_OF_CHILDS,
            setSliderCardsWidth,
            setSliderTrackStyles,
            prevSliderTrackStyles,
            slidesToShow,
            moveLeft
        )
    }, [COUNT_OF_CHILDS, slidesToShow, moveLeft]);

    // BUTTON HANDLER 
    const slideEventHandler = useCallback((coefficient, prevSliderTrackStyles, speed) => {
        _slideEventHandler(
            coefficient,
            isBlocked,
            counter,
            setHandleAutoControl,
            setSliderTrackStyles,
            sliderCardsWidth,
            COUNT_OF_CHILDS,
            prevSliderTrackStyles,
            speed,
            slidesToShow
        )
    }, [COUNT_OF_CHILDS, sliderCardsWidth, setHandleAutoControl, slidesToShow]);

    // MOUSE OUT
    const onHandleMouseOut = ({ clientX }) => {
        onHandleMouseUp({ clientX: clientX });
        sliderTrack.current.onmousemove = () => null;
    }

    // MOUSE DOWN
    const onHandleMouseDown = ({ clientX }) => {
        sliderTrack.current.onmouseout = e => onHandleMouseOut(e);
        _onHandleMouseDown(
            clientX,
            prevSliderTrackStyles,
            sliderTrackStyles,
            sliderTrack,
            onHandleMouseMove,
            memory
        )
    }

    // MOUSE MOVE
    function onHandleMouseMove({ clientX }) {
        _onHandleMouseMove(clientX, setSliderTrackStyles, memory)
    }

    // MOUSE UP
    const onHandleMouseUp = useCallback(({ clientX }) => {
        sliderTrack.current.onmouseout = () => null;
        _onHandleMouseUp(
            clientX,
            memory,
            sliderCardsWidth,
            slideEventHandler,
            setSliderTrackStyles,
            prevSliderTrackStyles,
            sliderTrack,
            200
        );
    }, [slideEventHandler, sliderCardsWidth]);

    // TOUCH START
    const onHandleTouchStart = e => {
        _onHandleTouchStart(
            e,
            sliderTrack,
            onHandleTouchMove,
            memory,
            sliderTrackStyles,
            prevSliderTrackStyles
        )
    }

    // TOUCH MOVE
    function onHandleTouchMove(e) {
        _onHandleTouchMove(e, setSliderTrackStyles, memory)
    }

    // TOUCH END
    const onHandleTouchEnd = (e) => {
        _onHandleTouchEnd(
            e,
            sliderTrack,
            memory,
            sliderCardsWidth,
            slideEventHandler,
            setSliderTrackStyles,
            prevSliderTrackStyles,
            200
        )
    }

    const onHandleCardClick = (e, index) => {
        e.stopPropagation();
        (index + 1 === COUNT_OF_CHILDS * 2 - counter.current) && slideEventHandler(1, null, speed);
        (index + 1 === (COUNT_OF_CHILDS * 2 + 2) - counter.current) && slideEventHandler(-1, null, speed);
    }

    useEffect(() => {
        if (children) {
            setHandleAutoControl();
            window.addEventListener("resize", setHandleAutoControl);

            return () => {
                window.removeEventListener('resize', setHandleAutoControl);
            }
        }
    }, [setHandleAutoControl, children]);

    useEffect(() => {
        interval.current = setInterval(() => {
            FREQUENCY !== 0 && slideEventHandler(direction === "left" ? -1 : 1, null, speed);
        }, FREQUENCY);

        return () => clearInterval(interval.current);
    }, [slideEventHandler, FREQUENCY, direction, speed]);

    return (
        <div className='container'>
            {
                children
                &&
                <section className="simple-slider">
                    <div className="simple-slider__inner">

                        <button
                            className='simple-slider__btn simple-slider__btn--next'
                            onClick={() => slideEventHandler(1, null, speed)}
                            style={isSmall ? { display: "none" } : ({
                                left: sliderCardsWidth / slidesToShow / 2 - 80,
                                top: sliderCardsWidth / slidesToShow / 4 - 12
                            })}
                        >
                            {"<"}
                        </button>

                        <div
                            className="simple-slider__cards"
                            ref={sliderCards}
                        >
                            <div
                                className="simple-slider__track"
                                style={sliderTrackStyles}
                                ref={sliderTrack}
                            >
                                {
                                    Children.map(memorizedChilds, (Item, index) => {
                                        return <div
                                            className='simple-slider__card'
                                            key={memorizedKeys[index]}
                                            style={{
                                                width: sliderCardsWidth / slidesToShow,
                                                height: sliderCardsWidth / (slidesToShow) / 2
                                            }}
                                            onClick={e => onHandleCardClick(e, index)}
                                            onMouseDown={e => {
                                                e.preventDefault()
                                                onHandleMouseDown(e)
                                            }}
                                            onMouseUp={e => {
                                                e.preventDefault()
                                                onHandleMouseUp(e)
                                            }}
                                            onTouchStart={onHandleTouchStart}
                                            onTouchEnd={onHandleTouchEnd}
                                        >
                                            {Item}
                                        </div>
                                    })
                                }
                            </div>

                        </div>

                        <button
                            className='simple-slider__btn simple-slider__btn--prev'
                            onClick={() => slideEventHandler(-1, null, speed)}
                            style={isSmall ? { display: "none" } : {
                                right: sliderCardsWidth / slidesToShow / 2 - 80,
                                top: sliderCardsWidth / slidesToShow / 4 - 12
                            }}
                        >
                            {">"}
                        </button>

                    </div>
                </section>
            }
        </div>
    )
})

export default SimpleSlider;