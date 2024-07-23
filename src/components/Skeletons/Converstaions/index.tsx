const Converstaions = () => {
  return (
    <div className=''>
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonConversation key={index} />
      ))}
    </div>
  )
}

const SkeletonConversation = () => {
  return <div></div>
}

export default Converstaions
