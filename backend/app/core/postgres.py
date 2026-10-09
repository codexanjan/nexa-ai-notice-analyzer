"""Durable JSON documents backed by PostgreSQL, using parameterized queries."""
import uuid
from datetime import datetime, timezone
from psycopg import AsyncConnection
from psycopg.types.json import Jsonb

def where(query):
    clauses, params = [], []
    for key, value in (query or {}).items():
        if key == '$or':
            parts = []
            for branch in value:
                sql, args = where(branch)
                parts.append('(' + sql + ')')
                params.extend(args)
            clauses.append('(' + ' OR '.join(parts) + ')')
        elif isinstance(value, dict):
            if '$in' in value:
                clauses.append('document -> %s = ANY(%s::jsonb[])')
                params.extend([key, [Jsonb(v) for v in value['$in']]])
            elif '$ne' in value:
                clauses.append('document -> %s IS DISTINCT FROM %s::jsonb')
                params.extend([key, Jsonb(value['$ne'])])
            else:
                raise ValueError('Unsupported query operator')
        else:
            clauses.append('document @> %s::jsonb')
            params.append(Jsonb({key:value}))
    return ' AND '.join(clauses) or 'TRUE', params

class PostgresCollection:
    def __init__(self, url, name):
        self.url, self.name = url, name

    async def find(self, query=None, sort=None, limit=None):
        predicate, args = where(query)
        sql = 'SELECT document FROM nexa_documents WHERE collection = %s AND ' + predicate
        args.insert(0, self.name)
        if sort:
            sql += ' ORDER BY ' + ', '.join('document -> %s ' + ('DESC' if direction == -1 else 'ASC') + ' NULLS LAST' for key, direction in sort)
            args.extend(key for key, direction in sort)
        if limit:
            sql += ' LIMIT %s'
            args.append(limit)
        async with await AsyncConnection.connect(self.url, connect_timeout=10) as conn:
            cursor = await conn.execute(sql, args)
            return [row[0] for row in await cursor.fetchall()]

    async def find_one(self, query):
        docs = await self.find(query, limit=1)
        return docs[0] if docs else None

    async def insert_one(self, document):
        doc = dict(document)
        doc.setdefault('_id', str(uuid.uuid4()))
        doc.setdefault('id', doc['_id'])
        doc.setdefault('created_at', datetime.now(timezone.utc).isoformat())
        doc.setdefault('updated_at', doc['created_at'])
        async with await AsyncConnection.connect(self.url, connect_timeout=10) as conn:
            await conn.execute('INSERT INTO nexa_documents (collection, id, document) VALUES (%s, %s, %s)', (self.name, doc['_id'], Jsonb(doc)))
        return doc

    async def update_one(self, query, update):
        predicate, args = where(query)
        values = dict(update.get('$set', update))
        values['updated_at'] = datetime.now(timezone.utc).isoformat()
        async with await AsyncConnection.connect(self.url, connect_timeout=10) as conn:
            cursor = await conn.execute('UPDATE nexa_documents SET document = document || %s::jsonb WHERE collection = %s AND ' + predicate, [Jsonb(values), self.name] + args)
            return cursor.rowcount

    async def delete_one(self, query):
        predicate, args = where(query)
        async with await AsyncConnection.connect(self.url, connect_timeout=10) as conn:
            cursor = await conn.execute('DELETE FROM nexa_documents WHERE collection = %s AND ' + predicate, [self.name] + args)
            return cursor.rowcount

    async def count_documents(self, query=None):
        predicate, args = where(query)
        async with await AsyncConnection.connect(self.url, connect_timeout=10) as conn:
            cursor = await conn.execute('SELECT count(*) FROM nexa_documents WHERE collection = %s AND ' + predicate, [self.name] + args)
            return (await cursor.fetchone())[0]

    async def distinct(self, key):
        async with await AsyncConnection.connect(self.url, connect_timeout=10) as conn:
            cursor = await conn.execute('SELECT DISTINCT document -> %s FROM nexa_documents WHERE collection = %s', (key, self.name))
            return [row[0] for row in await cursor.fetchall() if row[0] is not None]

async def initialize_postgres(url):
    async with await AsyncConnection.connect(url, connect_timeout=10) as conn:
        await conn.execute('CREATE TABLE IF NOT EXISTS nexa_documents (collection TEXT NOT NULL, id TEXT NOT NULL, document JSONB NOT NULL, PRIMARY KEY (collection, id))')
        await conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS nexa_user_email ON nexa_documents ((document ->> 'email')) WHERE collection = 'users'")
