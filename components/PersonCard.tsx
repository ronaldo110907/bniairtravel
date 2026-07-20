type PersonCardProps = {
  person: any;
};

export default function PersonCard({ person }: PersonCardProps) {
  return <div>{person.name}</div>;
}
